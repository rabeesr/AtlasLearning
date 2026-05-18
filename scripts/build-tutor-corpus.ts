/**
 * build-tutor-corpus
 * ------------------
 * Embeds the tutor's retrieval corpus and emits a SQL file of
 * DELETE + INSERT statements at scripts/tutor-corpus.generated.sql.
 *
 * Apply the emitted SQL via the Supabase MCP (mcp__supabase__execute_sql)
 * — this avoids needing a service-role key on the free plan.
 *
 * Sources:
 *   - src/data/domains/robotics/topics/<whitelisted>.md   (kind: 'topic')
 *   - src/data/references/*.md                            (kind: 'reference')
 *
 * Run:  npm run build:tutor-corpus
 *
 * Env required:
 *   VOYAGE_API_KEY                — voyage-3-lite embeddings (free tier OK)
 */

import { config as loadEnv } from "dotenv";
import { readFile, readdir, writeFile } from "node:fs/promises";
import { join, basename, extname } from "node:path";

// Load .env.local first (Next.js convention), then .env as fallback.
loadEnv({ path: ".env.local" });
loadEnv();

const TOPIC_WHITELIST = [
  "linear-algebra-robotics",
  "calculus-robotics",
] as const;

const ROOT = process.cwd();
const TOPIC_DIR = join(ROOT, "src/data/domains/robotics/topics");
const REFERENCE_DIR = join(ROOT, "src/data/references");
const OUT_SQL = join(ROOT, "scripts/tutor-corpus.generated.sql");

const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;

if (!VOYAGE_API_KEY) throw new Error("VOYAGE_API_KEY is required");

interface Chunk {
  source_kind: "topic" | "reference";
  source_id: string;
  section: string | null;
  content: string;
}

function stripFrontmatter(md: string): string {
  if (!md.startsWith("---")) return md;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return md;
  return md.slice(end + 4).replace(/^\s+/, "");
}

/** Split markdown by H2 headings. The text before the first H2 is an "intro" chunk. */
function chunkByH2(md: string): { section: string | null; content: string }[] {
  const body = stripFrontmatter(md);
  const lines = body.split("\n");
  const chunks: { section: string | null; content: string }[] = [];
  let currentSection: string | null = null;
  let currentBuf: string[] = [];

  const flush = () => {
    const content = currentBuf.join("\n").trim();
    if (content.length > 0) {
      chunks.push({ section: currentSection, content });
    }
  };

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+?)\s*$/);
    if (h2) {
      flush();
      currentSection = h2[1].trim();
      currentBuf = [`## ${currentSection}`];
    } else {
      currentBuf.push(line);
    }
  }
  flush();

  // Fallback: if a single chunk is huge (>2000 chars), split by paragraph.
  const refined: { section: string | null; content: string }[] = [];
  for (const c of chunks) {
    if (c.content.length <= 2000) {
      refined.push(c);
      continue;
    }
    const paragraphs = c.content.split(/\n\n+/);
    let buf = "";
    for (const p of paragraphs) {
      if (buf.length + p.length + 2 > 1500 && buf.length > 0) {
        refined.push({ section: c.section, content: buf.trim() });
        buf = p;
      } else {
        buf = buf ? `${buf}\n\n${p}` : p;
      }
    }
    if (buf.trim().length > 0) {
      refined.push({ section: c.section, content: buf.trim() });
    }
  }
  return refined;
}

async function loadSources(): Promise<Chunk[]> {
  const chunks: Chunk[] = [];

  for (const slug of TOPIC_WHITELIST) {
    const path = join(TOPIC_DIR, `${slug}.md`);
    const raw = await readFile(path, "utf8");
    for (const c of chunkByH2(raw)) {
      chunks.push({
        source_kind: "topic",
        source_id: slug,
        section: c.section,
        content: c.content,
      });
    }
  }

  const refFiles = (await readdir(REFERENCE_DIR)).filter(
    (f) => extname(f) === ".md",
  );
  for (const f of refFiles) {
    const path = join(REFERENCE_DIR, f);
    const raw = await readFile(path, "utf8");
    const sourceId = basename(f, ".md");
    for (const c of chunkByH2(raw)) {
      chunks.push({
        source_kind: "reference",
        source_id: sourceId,
        section: c.section,
        content: c.content,
      });
    }
  }

  return chunks;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  // Voyage REST: https://docs.voyageai.com/reference/embeddings-api
  const res = await fetch("https://api.voyageai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VOYAGE_API_KEY}`,
    },
    body: JSON.stringify({
      input: texts,
      model: "voyage-3-lite",
      input_type: "document",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Voyage embed failed (${res.status}): ${body}`);
  }
  const json = (await res.json()) as {
    data: { embedding: number[]; index: number }[];
  };
  return json.data
    .slice()
    .sort((a, b) => a.index - b.index)
    .map((d) => d.embedding);
}

function sqlQuote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlNullable(value: string | null): string {
  return value === null ? "NULL" : sqlQuote(value);
}

function vectorLiteral(embedding: number[]): string {
  // pgvector accepts a text-formatted bracketed list cast to vector(N).
  return `'[${embedding.map((n) => n.toString()).join(",")}]'`;
}

async function main() {
  console.log("[build-tutor-corpus] loading sources…");
  const chunks = await loadSources();
  console.log(`[build-tutor-corpus] ${chunks.length} chunks to embed`);

  // Voyage free tier (no payment method): 3 RPM and 10K TPM.
  // Stay comfortably under both: small batches + 25s sleep between requests.
  const EMBED_BATCH = 15;
  const SLEEP_MS = 25_000;
  const embedded: (Chunk & { embedding: number[] })[] = [];
  for (let i = 0; i < chunks.length; i += EMBED_BATCH) {
    const slice = chunks.slice(i, i + EMBED_BATCH);
    const embeddings = await embedBatch(slice.map((c) => c.content));
    for (let j = 0; j < slice.length; j++) {
      embedded.push({ ...slice[j], embedding: embeddings[j] });
    }
    console.log(
      `[build-tutor-corpus] embedded ${embedded.length} / ${chunks.length}`,
    );
    if (i + EMBED_BATCH < chunks.length) {
      await new Promise((r) => setTimeout(r, SLEEP_MS));
    }
  }

  // Emit SQL.
  const lines: string[] = [];
  lines.push("-- Generated by scripts/build-tutor-corpus.ts");
  lines.push("-- Apply via: mcp__supabase__execute_sql");
  lines.push("");

  const uniqueSources = Array.from(
    new Set(embedded.map((c) => `${c.source_kind}::${c.source_id}`)),
  );
  for (const key of uniqueSources) {
    const [source_kind, source_id] = key.split("::") as [
      "topic" | "reference",
      string,
    ];
    lines.push(
      `DELETE FROM public.reference_chunks WHERE source_kind = ${sqlQuote(source_kind)} AND source_id = ${sqlQuote(source_id)};`,
    );
  }
  lines.push("");

  const INSERT_BATCH = 50;
  for (let i = 0; i < embedded.length; i += INSERT_BATCH) {
    const slice = embedded.slice(i, i + INSERT_BATCH);
    lines.push(
      "INSERT INTO public.reference_chunks (source_kind, source_id, section, content, embedding) VALUES",
    );
    const rows = slice.map((c, idx) => {
      const row = `(${sqlQuote(c.source_kind)}, ${sqlQuote(c.source_id)}, ${sqlNullable(c.section)}, ${sqlQuote(c.content)}, ${vectorLiteral(c.embedding)}::vector(512))`;
      return idx === slice.length - 1 ? `${row};` : `${row},`;
    });
    lines.push(...rows);
    lines.push("");
  }

  await writeFile(OUT_SQL, lines.join("\n"), "utf8");
  console.log(
    `[build-tutor-corpus] wrote ${embedded.length} rows -> ${OUT_SQL}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
