"use client";

import { usePathname } from "next/navigation";
import React from "react";

import { Button } from "@/components/shared/ui";
import { TopicMarkdown } from "@/components/topic/topic-markdown";
import { TutorDiffBubble } from "@/components/tutor/tutor-diff-bubble";
import { useTutor } from "@/components/tutor/tutor-context";
import { linkifyCitations } from "@/lib/tutor/linkify-citations";
import type {
  TutorMessage,
  TutorReply,
  TutorRequest,
  TutorSurface,
} from "@/lib/tutor/types";

function newSessionId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function surfaceLabel(s: TutorSurface): string {
  switch (s.kind) {
    case "learn":
      return `Reading: ${pretty(s.topicSlug)}${s.section ? ` — ${s.section}` : ""}`;
    case "quiz":
      return `Quiz: ${pretty(s.topicSlug)}`;
    case "flashcard":
      return `Flashcards: ${pretty(s.topicSlug)}`;
    case "challenge":
      return `Challenge: ${pretty(s.challengeSlug)}`;
    case "review":
      return `Review (${s.mode})`;
    case "global":
    default:
      return "Ask anything";
  }
}

function pretty(slug?: string): string {
  if (!slug) return "—";
  return slug
    .split("-")
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(" ");
}

interface DisplayMessage {
  role: "user" | "assistant";
  reply: TutorReply;
}

export function TutorCompanion() {
  const pathname = usePathname() ?? "";
  const tutor = useTutor();
  const [messages, setMessages] = React.useState<DisplayMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [sessionId, setSessionId] = React.useState(() => newSessionId());
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  // Seed from open() option (e.g., "Ask about this section" prefill).
  React.useEffect(() => {
    if (tutor.isOpen && tutor.seed) {
      setInput(tutor.seed);
    }
  }, [tutor.isOpen, tutor.seed]);

  // Reset session when surface changes meaningfully.
  const surfaceKey = JSON.stringify(tutor.surface);
  React.useEffect(() => {
    setMessages([]);
    setSessionId(newSessionId());
  }, [surfaceKey]);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, busy]);

  // Don't render on auth pages.
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    return null;
  }

  const askTutor = async (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed || busy) return;
    setInput("");
    setBusy(true);

    const userDisplay: DisplayMessage = {
      role: "user",
      reply: { kind: "question", text: trimmed },
    };
    setMessages((prev) => [...prev, userDisplay]);

    // Build history payload for the route.
    const history: TutorMessage[] = messages.map((m) => ({
      role: m.role,
      content:
        m.reply.kind === "diff_hint"
          ? JSON.stringify({ text: m.reply.text, diff: m.reply.diff ?? [] })
          : m.reply.text,
    }));

    const body: TutorRequest = {
      sessionId,
      surface: tutor.surface,
      userMessage: trimmed,
      history,
    };

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const reply = (await res.json()) as TutorReply & { error?: string };
      if ("error" in reply && reply.error) {
        throw new Error(reply.error);
      }
      setMessages((prev) => [...prev, { role: "assistant", reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          reply: {
            kind: "question",
            text: `I hit a snag reaching the tutor service (${String(
              err,
            )}). Want to try again?`,
          },
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void askTutor(input);
  };

  return (
    <>
      {/* Ask Atlas floating pill */}
      {!tutor.isOpen ? (
        <button
          type="button"
          onClick={() => tutor.open()}
          className="fixed bottom-6 right-6 z-40 inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-[14px] font-semibold text-white shadow-[0_8px_24px_-8px_rgba(0,102,204,0.55)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-10px_rgba(0,102,204,0.7)]"
          aria-label="Open Atlas tutor"
        >
          <span aria-hidden>✦</span> Ask Atlas
        </button>
      ) : null}

      {/* Slide-in panel */}
      {tutor.isOpen ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/15 backdrop-blur-[2px]"
          onClick={tutor.close}
        >
          <div
            className="flex h-full w-full max-w-[640px] flex-col bg-white shadow-[-12px_0_32px_-12px_rgba(0,0,0,0.25)]"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Atlas tutor"
          >
            <header className="flex items-center justify-between px-5 py-4">
              <div className="flex flex-col gap-1">
                <span className="text-[18px] font-semibold text-[var(--ink-strong)]">
                  Ask Atlas
                </span>
                <span className="text-[12px] uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                  {surfaceLabel(tutor.surface)}
                </span>
              </div>
              <button
                type="button"
                onClick={tutor.close}
                className="rounded-full bg-[var(--tile)] px-3 py-1.5 text-[13px] text-[var(--ink-muted)] transition hover:text-[var(--ink)]"
                aria-label="Close tutor"
              >
                Close
              </button>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-3"
              aria-live="polite"
            >
              {messages.length === 0 && !busy ? (
                <EmptyState surface={tutor.surface} />
              ) : null}
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <Bubble key={i} role={m.role} reply={m.reply} />
                ))}
                {busy ? (
                  <Bubble
                    role="assistant"
                    reply={{ kind: "question", text: "Thinking…" }}
                    muted
                  />
                ) : null}
              </div>
            </div>

            <form
              onSubmit={onSubmit}
              className="flex items-end gap-2 border-t-0 bg-[var(--tile)] px-3 py-3"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={placeholderFor(tutor.surface)}
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void askTutor(input);
                  }
                }}
                className="flex-1 resize-none rounded-[14px] bg-white px-3 py-2 text-[14px] leading-6 text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
              />
              <Button
                type="submit"
                variant="accent"
                size="sm"
                className={
                  busy || !input.trim() ? "pointer-events-none opacity-50" : ""
                }
              >
                Send
              </Button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

function placeholderFor(surface: TutorSurface): string {
  switch (surface.kind) {
    case "learn":
      return "Ask about a concept on this page…";
    case "quiz":
      return "Stuck on this question? Ask, but don't expect the answer.";
    case "flashcard":
      return "Need a nudge on this card?";
    case "challenge":
      return "What's puzzling you about the code?";
    case "review":
      return "Ask about the current item…";
    case "global":
    default:
      return "Ask anything about robotics…";
  }
}

function EmptyState({ surface }: { surface: TutorSurface }) {
  const lines: Record<TutorSurface["kind"], string> = {
    learn: "I can explain concepts from this topic and tie them to your code work.",
    quiz: "I'll never reveal the answer, but I can help you reason it out.",
    flashcard: "I can't see the back of the card. Try recalling first, then ask me what's hazy.",
    challenge: "Show me what you've tried and where it broke.",
    review: "I'll keep things Socratic — your job is to recall.",
    global: "Ask about any robotics concept. I'll cite what I'm working from.",
  };
  return (
    <div className="rounded-[16px] bg-[var(--tile)] px-4 py-4 text-[13.5px] leading-6 text-[var(--ink-muted)]">
      {lines[surface.kind]}
    </div>
  );
}

function Bubble({
  role,
  reply,
  muted,
}: {
  role: "user" | "assistant";
  reply: TutorReply;
  muted?: boolean;
}) {
  const isUser = role === "user";
  // Wide bubble for substantive `explain` replies so long content reads well.
  const widthClass =
    !isUser && reply.kind === "explain" ? "max-w-full" : "max-w-[88%]";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={[
          widthClass,
          "rounded-[18px] px-4 py-2.5 text-[14px] leading-6",
          isUser
            ? "bg-[var(--accent)] text-white"
            : muted
              ? "bg-[var(--tile)] text-[var(--ink-faint)] italic"
              : "bg-[var(--tile)] text-[var(--ink)]",
        ].join(" ")}
      >
        {isUser || muted ? (
          <p className="whitespace-pre-wrap">{reply.text}</p>
        ) : (
          <TopicMarkdown content={linkifyCitations(reply.text)} />
        )}
        {reply.kind === "diff_hint" && reply.diff ? (
          <TutorDiffBubble diff={reply.diff} />
        ) : null}
      </div>
    </div>
  );
}
