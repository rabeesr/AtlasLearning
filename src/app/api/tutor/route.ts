import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCodingChallenge } from "@/lib/practice/challenge-repository";
import { getTopicContent } from "@/lib/content/topic-content";
import { getGroqClient, TUTOR_MODEL } from "@/lib/tutor/groq-client";
import { retrieveChunks } from "@/lib/tutor/retrieval";
import {
  buildSystemPrompt,
  violatesSurfaceContract,
} from "@/lib/tutor/system-prompt";
import type {
  TutorMessage,
  TutorReply,
  TutorRequest,
  TutorSurface,
} from "@/lib/tutor/types";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_USER_MSG = 4000;
const MAX_CODE = 6000;
const MAX_TRACE = 2000;
const MAX_HISTORY = 6;

const LEAK_KEY_RE = /answer|solution|correct|cardback/i;

function sanitizeSurface(surface: TutorSurface): TutorSurface {
  // Belt-and-braces: even if the client smuggled forbidden fields, drop them.
  const cleaned: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(surface)) {
    if (LEAK_KEY_RE.test(k)) continue;
    cleaned[k] = v;
  }
  return cleaned as unknown as TutorSurface;
}

async function loadSurfaceBlock(surface: TutorSurface): Promise<{
  surfaceXml: string;
  topicSlug?: string;
  topicNotes?: string;
}> {
  switch (surface.kind) {
    case "learn": {
      const topic = await getTopicContent(surface.topicSlug);
      const body = topic?.body ?? "";
      const section = surface.section ?? "";
      return {
        surfaceXml: `<surface kind="learn" topic="${surface.topicSlug}"${
          section ? ` section="${escapeAttr(section)}"` : ""
        }>The student is reading the topic notes${
          section ? ` near the section titled "${section}"` : ""
        }.</surface>`,
        topicSlug: surface.topicSlug,
        topicNotes: body,
      };
    }
    case "quiz": {
      const topic = await getTopicContent(surface.topicSlug);
      const choicesBlock = surface.choices?.length
        ? `\nChoices:\n${surface.choices.map((c, i) => `  ${i + 1}. ${c}`).join("\n")}`
        : "";
      return {
        surfaceXml: `<surface kind="quiz" topic="${surface.topicSlug}">The student is mid-quiz.
Question: ${surface.questionText}${choicesBlock}
The correct answer has NOT been provided to you. Do not guess it.</surface>`,
        topicSlug: surface.topicSlug,
        topicNotes: topic?.body ?? "",
      };
    }
    case "flashcard": {
      const topic = await getTopicContent(surface.topicSlug);
      return {
        surfaceXml: `<surface kind="flashcard" topic="${surface.topicSlug}">The student is reviewing a flashcard.
Front of card: ${surface.cardFront}
The back of the card has NOT been provided to you. Do not guess it.</surface>`,
        topicSlug: surface.topicSlug,
        topicNotes: topic?.body ?? "",
      };
    }
    case "challenge": {
      const challenge = await getCodingChallenge(surface.challengeSlug);
      const topicSlug = surface.topicSlug ?? challenge?.topicSlugs?.[0];
      const topic = topicSlug ? await getTopicContent(topicSlug) : null;
      const problem = challenge?.problemMarkdown ?? "(problem unavailable)";
      const testNames =
        challenge?.tests?.map((t) => `  - ${t.name}`).join("\n") ?? "  (none)";
      const userCode = (surface.userCode ?? "").slice(0, MAX_CODE);
      const traceback = (surface.lastTraceback ?? "").slice(0, MAX_TRACE);
      return {
        surfaceXml: `<surface kind="challenge" slug="${surface.challengeSlug}">
<problem>
${problem}
</problem>
<test_names>
${testNames}
</test_names>
<student_code language="python">
${userCode}
</student_code>${
          traceback
            ? `\n<last_traceback>\n${traceback}\n</last_traceback>`
            : ""
        }
</surface>`,
        topicSlug,
        topicNotes: topic?.body ?? "",
      };
    }
    case "review": {
      const topic = surface.topicSlug
        ? await getTopicContent(surface.topicSlug)
        : null;
      return {
        surfaceXml: `<surface kind="review" mode="${surface.mode}"${
          surface.topicSlug ? ` topic="${surface.topicSlug}"` : ""
        }>The student is in an interleaved review session. Treat each prompt cautiously; do not reveal answers.</surface>`,
        topicSlug: surface.topicSlug,
        topicNotes: topic?.body ?? "",
      };
    }
    case "global":
    default:
      return {
        surfaceXml: `<surface kind="global">The student is browsing AtlasLearning and asked a free-form question.</surface>`,
      };
  }
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function trimHistory(history: TutorMessage[]): TutorMessage[] {
  if (!Array.isArray(history)) return [];
  return history.slice(-MAX_HISTORY);
}

function buildRetrievalQuery(
  surface: TutorSurface,
  userMessage: string,
): string {
  // Mix the user's message with surface signals so retrieval is grounded.
  const bits: string[] = [userMessage];
  if (surface.kind === "challenge") {
    if (surface.lastTraceback) bits.push(surface.lastTraceback.slice(0, 500));
  }
  if (surface.kind === "quiz") {
    bits.push(surface.questionText);
  }
  if (surface.kind === "flashcard") {
    bits.push(surface.cardFront);
  }
  return bits.join("\n").slice(0, 1500);
}

function formatChunks(
  chunks: Awaited<ReturnType<typeof retrieveChunks>>,
): string {
  if (chunks.length === 0) return "<references>(none)</references>";
  const blocks = chunks.map((c) => {
    const tag = `[${c.source_id}${c.section ? `:${c.section}` : ""}]`;
    return `${tag}\n${c.content}`;
  });
  return `<references>\n${blocks.join("\n\n")}\n</references>`;
}

/**
 * Repair stray LaTeX backslashes in a JSON-ish string before parse.
 *
 * Models emitting LaTeX inside JSON strings often forget to double-escape
 * backslashes. JSON.parse then rejects `\l`, `\m`, `\b`, `\d`, etc., or
 * silently swallows them (turning `\begin{bmatrix}` into `egin{bmatrix}`).
 * We pre-process by doubling every backslash that isn't already part of a
 * valid JSON escape (`\"`, `\\`, `\/`, `\b`, `\f`, `\n`, `\r`, `\t`,
 * `\uXXXX`).
 */
/**
 * Heuristic: if the raw model output looked like a JSON envelope
 * `{ "kind": "...", "text": "..." }` but failed to parse (e.g. LaTeX
 * backslashes), pull the `text` field out by regex so we can render it.
 * If no envelope shape is detected, return the input unchanged.
 */
function stripJsonEnvelopeIfPresent(s: string): string {
  const cleaned = s
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  if (!cleaned.startsWith("{")) return cleaned;
  const m = cleaned.match(/"text"\s*:\s*"([\s\S]*)"\s*[},]/);
  if (!m) return cleaned;
  // Unescape \\" → " ; leave everything else (model's literal characters) as-is.
  return m[1].replace(/\\"/g, '"');
}

function repairLatexBackslashes(s: string): string {
  // The model emits LaTeX inside JSON string literals (e.g. \lambda, \\ for
  // a matrix row break, \begin{vmatrix}). None of these are valid JSON
  // escapes, and naive per-token repair gets the \\-pair case wrong (it
  // either keeps it as escaped-backslash and loses the second `\`, or
  // doubles only the second and emits an odd number of backslashes).
  //
  // Pragmatic fix: walk the string, and inside string literals, treat every
  // backslash as a *literal* character that needs doubling — except for
  // \" (escaped quote), which we preserve to keep the string boundaries
  // intact. Tutor replies never emit legitimate \n / \t escapes (they use
  // real newlines in the source), so this loses nothing useful.
  let out = "";
  let inStr = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (!inStr) {
      out += ch;
      if (ch === '"') inStr = true;
      continue;
    }
    if (ch === "\\") {
      const next = s[i + 1];
      if (next === '"') {
        out += '\\"';
        i++;
        continue;
      }
      out += "\\\\";
      continue;
    }
    if (ch === '"') {
      out += ch;
      inStr = false;
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * Pull the outermost balanced {...} object out of a string, skipping over
 * braces that live inside JSON string literals. Returns null if no
 * balanced object is found.
 */
function extractJsonObject(s: string): string | null {
  const start = s.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inStr = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inStr) {
      if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inStr = false;
      }
      continue;
    }
    if (ch === '"') {
      inStr = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

function parseReply(raw: string): TutorReply | null {
  // The model may wrap in code fences or surround the JSON with prose;
  // be defensive at every layer.
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  const candidates: string[] = [];
  candidates.push(cleaned);
  const extracted = extractJsonObject(cleaned);
  if (extracted && extracted !== cleaned) candidates.push(extracted);
  // Add repaired (LaTeX-backslash-safe) versions of each candidate.
  for (const c of [...candidates]) {
    const repaired = repairLatexBackslashes(c);
    if (repaired !== c) candidates.push(repaired);
  }

  for (const candidate of candidates) {
    try {
      const obj = JSON.parse(candidate);
      const reply = normalizeReply(obj);
      if (reply) return reply;
    } catch {
      // try next candidate
    }
  }
  return null;
}

function normalizeReply(obj: unknown): TutorReply | null {
  if (!obj || typeof obj !== "object") return null;
  const o = obj as Record<string, unknown>;
  const kind = String(o.kind ?? "");
  const text = String(o.text ?? "");
  if (!["question", "explain", "diff_hint"].includes(kind)) return null;
  if (kind === "diff_hint") {
    const diffRaw = Array.isArray(o.diff) ? o.diff : [];
    const diff = diffRaw
      .map((d) => {
        if (!d || typeof d !== "object") return null;
        const dd = d as Record<string, unknown>;
        if (typeof dd.line !== "number") return null;
        return {
          line: dd.line,
          before: String(dd.before ?? ""),
          after: String(dd.after ?? ""),
        };
      })
      .filter((x): x is { line: number; before: string; after: string } => x !== null)
      .slice(0, 2);
    return { kind: "diff_hint", text, diff };
  }
  return { kind: kind as "question" | "explain", text };
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function persistExchange(
  userId: string,
  body: TutorRequest,
  reply: TutorReply,
) {
  const supabase = adminClient();
  if (!supabase) return;
  const rows = [
    {
      user_id: userId,
      session_id: body.sessionId,
      surface: body.surface.kind,
      surface_ref: surfaceRef(body.surface),
      role: "user" as const,
      kind: "question" as const,
      content: body.userMessage,
    },
    {
      user_id: userId,
      session_id: body.sessionId,
      surface: body.surface.kind,
      surface_ref: surfaceRef(body.surface),
      role: "assistant" as const,
      kind: reply.kind,
      content:
        reply.kind === "diff_hint"
          ? JSON.stringify({ text: reply.text, diff: reply.diff ?? [] })
          : reply.text,
    },
  ];
  const { error } = await supabase.from("tutor_exchanges").insert(rows);
  if (error) {
    console.error("[tutor] persist failed:", error);
  }
}

function surfaceRef(surface: TutorSurface): Record<string, unknown> {
  // Persist a JSON breadcrumb for replay/debug, with no answer-leak fields.
  const ref: Record<string, unknown> = { kind: surface.kind };
  switch (surface.kind) {
    case "learn":
      ref.topicSlug = surface.topicSlug;
      if (surface.section) ref.section = surface.section;
      break;
    case "quiz":
      ref.topicSlug = surface.topicSlug;
      ref.questionId = surface.questionId;
      break;
    case "flashcard":
      ref.topicSlug = surface.topicSlug;
      break;
    case "challenge":
      ref.challengeSlug = surface.challengeSlug;
      if (surface.topicSlug) ref.topicSlug = surface.topicSlug;
      break;
    case "review":
      ref.mode = surface.mode;
      if (surface.topicSlug) ref.topicSlug = surface.topicSlug;
      break;
  }
  return ref;
}

export async function POST(req: Request) {
  let body: TutorRequest;
  try {
    body = (await req.json()) as TutorRequest;
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const { userId } = await auth();
  const surface = sanitizeSurface(body.surface);
  const userMessage = String(body.userMessage ?? "").slice(0, MAX_USER_MSG);
  if (!userMessage.trim()) {
    return NextResponse.json({ error: "userMessage required" }, { status: 400 });
  }
  const history = trimHistory(body.history ?? []);

  try {
    const { surfaceXml, topicSlug, topicNotes } = await loadSurfaceBlock(
      surface,
    );

    const retrievalQuery = buildRetrievalQuery(surface, userMessage);
    let chunks: Awaited<ReturnType<typeof retrieveChunks>> = [];
    try {
      chunks = await retrieveChunks(retrievalQuery, 3, topicSlug);
    } catch (err) {
      console.warn("[tutor] retrieval failed, continuing without:", err);
    }

    const systemPrompt = buildSystemPrompt(surface);
    const contextBlock = [
      surfaceXml,
      topicNotes
        ? `<topic_notes topic="${topicSlug}">\n${topicNotes.slice(0, 4000)}\n</topic_notes>`
        : "",
      formatChunks(chunks),
    ]
      .filter(Boolean)
      .join("\n\n");

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: contextBlock },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: userMessage },
    ];

    const groq = getGroqClient();
    const completion = await groq.chat.completions.create({
      model: TUTOR_MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 1500,
      // Intentionally NOT using response_format: json_object — forcing
      // strict JSON mode causes the model to mangle LaTeX backslashes
      // (e.g. \begin{bmatrix} → egin{bmatrix}). We parse leniently with
      // backslash repair in parseReply().
    });
    const raw = completion.choices?.[0]?.message?.content ?? "";
    let retryRaw = "";

    let reply = parseReply(raw);
    // Validate against the surface contract; retry once on violation.
    if (reply && violatesSurfaceContract(surface, reply.kind)) {
      reply = null;
    }
    if (!reply) {
      console.warn(
        "[tutor] primary parse failed; raw reply was:\n---\n" +
          raw.slice(0, 2000) +
          (raw.length > 2000 ? "\n…(truncated)" : "") +
          "\n---",
      );
      const corrective = violatesSurfaceContract(
        surface,
        reply ? (reply as TutorReply).kind : "",
      );
      const retry = await groq.chat.completions.create({
        model: TUTOR_MODEL,
        messages: [
          ...messages,
          {
            role: "assistant" as const,
            content: raw || "(invalid response)",
          },
          {
            role: "user" as const,
            content:
              corrective ??
              "Your previous response did not match the required JSON envelope. Reply again with strictly { \"kind\": ..., \"text\": ... } and no prose outside.",
          },
        ],
        temperature: 0.2,
        max_tokens: 1500,
      });
      retryRaw = retry.choices?.[0]?.message?.content ?? "";
      reply = parseReply(retryRaw);
      if (reply && violatesSurfaceContract(surface, reply.kind)) reply = null;
      if (!reply) {
        console.warn(
          "[tutor] retry parse failed too; raw retry reply was:\n---\n" +
            retryRaw.slice(0, 2000) +
            (retryRaw.length > 2000 ? "\n…(truncated)" : "") +
            "\n---",
        );
      }
    }
    if (!reply) {
      // Last resort: if the model produced prose but no JSON envelope,
      // and the surface allows `explain`, treat the raw markdown as an
      // explain reply. Better than a useless apology bubble. Prefer the
      // retry output (more likely to be JSON-shaped) but fall back to the
      // primary if retry didn't run.
      const fallbackText = (retryRaw || raw || "").trim();
      const allowsExplain = !violatesSurfaceContract(surface, "explain");
      if (fallbackText.length > 0 && allowsExplain) {
        console.warn("[tutor] using raw-text fallback as explain reply");
        reply = { kind: "explain", text: stripJsonEnvelopeIfPresent(fallbackText) };
      }
    }
    if (!reply) {
      return NextResponse.json(
        {
          kind: "question" as const,
          text: "Something went wrong on my end. Can you re-state your question in a slightly different way?",
        },
        { status: 200 },
      );
    }

    // Persist (skip demo / signed-out).
    if (userId && userId !== "demo-user") {
      await persistExchange(userId, { ...body, surface }, reply);
    }

    return NextResponse.json(reply, { status: 200 });
  } catch (err) {
    console.error("[tutor] error:", err);
    return NextResponse.json(
      { error: "tutor error", detail: String(err) },
      { status: 500 },
    );
  }
}
