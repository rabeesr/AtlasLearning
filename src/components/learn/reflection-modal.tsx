"use client";

import { useEffect, useState } from "react";

import { Badge, Button } from "@/components/shared/ui";
import type { ReflectionTriggerOpts } from "@/components/learn/reflection-context";
import { useSupabase } from "@/hooks/useSupabase";

/**
 * Global session-reflection modal. Rendered by `ReflectionProvider` whenever
 * a consumer calls `trigger({ kind, topicSlug })`. Three optional fields,
 * Skip + Submit; demo users (no userId) never write.
 *
 * On desktop: centered rounded card. On mobile: rises from the bottom as a
 * sheet. Apple aesthetic — borderless, soft, pill submit.
 */
export function ReflectionModal({
  opts,
  onClose,
}: {
  opts: ReflectionTriggerOpts;
  onClose: () => void;
}) {
  const { supabase, userId } = useSupabase();
  const [clicked, setClicked] = useState("");
  const [murky, setMurky] = useState("");
  const [next, setNext] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Close on Esc.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const kindLabel: Record<ReflectionTriggerOpts["kind"], string> = {
    quiz: "Quiz",
    "mixed-session": "Mixed review",
    flashcards: "Flashcards",
    challenge: "Coding challenge",
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const text = [
        clicked && `What clicked: ${clicked}`,
        murky && `Still murky: ${murky}`,
        next && `What's next: ${next}`,
      ]
        .filter(Boolean)
        .join("\n\n");

      // No-op for unauthenticated / demo users.
      if (userId && text.trim().length > 0) {
        const { error } = await supabase.from("topic_journal_entries").insert({
          user_id: userId,
          topic_slug: opts.topicSlug ?? null,
          kind: "reflection",
          entry_text: text,
          metadata: {
            session_kind: opts.kind,
            clicked,
            murky,
            next,
          },
        });
        if (error) {
          console.error("[reflection-modal] insert failed:", error);
        }
      }
    } finally {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-t-[24px] bg-white p-6 shadow-2xl sm:rounded-[24px] sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-2 flex items-center gap-2">
          <Badge tone="accent">Reflection</Badge>
          <Badge tone="neutral">{kindLabel[opts.kind]}</Badge>
        </div>
        <h2 className="text-[22px] font-semibold leading-tight text-[var(--ink)]">
          Take 30 seconds before you move on.
        </h2>
        <p className="mt-2 text-[14px] text-[var(--ink-muted)]">
          Each prompt is optional. Skipping won&apos;t lose anything.
        </p>

        <div className="mt-6 space-y-4">
          <Field
            label="What clicked?"
            value={clicked}
            onChange={setClicked}
            placeholder="A concept that finally made sense…"
          />
          <Field
            label="What's still murky?"
            value={murky}
            onChange={setMurky}
            placeholder="An idea you'd flag for another pass…"
          />
          <Field
            label="What's next?"
            value={next}
            onChange={setNext}
            placeholder="The one thing you'll try tomorrow…"
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Skip
          </Button>
          <Button
            variant="accent"
            onClick={submit}
            size="md"
          >
            {submitting ? "Saving…" : "Save reflection"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <label className="block">
      <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--ink-muted)]">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="mt-2 w-full resize-none rounded-[14px] bg-[var(--tile)] p-3 text-[15px] leading-[1.5] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
      />
    </label>
  );
}
