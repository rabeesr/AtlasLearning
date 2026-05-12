"use client";

import { useEffect, useState } from "react";

import { Badge, Button, Card } from "@/components/shared/ui";
import { useSupabase } from "@/hooks/useSupabase";

interface JournalRow {
  id: string;
  entry_text: string;
  created_at: string;
}

/**
 * <FreeRecallPrompt> — appears at the bottom of every topic learn page.
 * Asks "what would you tell a friend?" — a free-recall pull on the topic.
 * Saves to `topic_journal_entries` with `kind = 'free_recall'`.
 *
 * On revisits, shows the most recent entry as a "compare with last time"
 * card so the user can see their own previous explanation before writing
 * a new one. Demo users (no userId) get the UI but no DB writes.
 */
export function FreeRecallPrompt({ topicSlug }: { topicSlug: string }) {
  const { supabase, userId, isLoaded } = useSupabase();
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [previous, setPrevious] = useState<JournalRow | null>(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("topic_journal_entries")
        .select("id, entry_text, created_at")
        .eq("topic_slug", topicSlug)
        .eq("kind", "free_recall")
        .order("created_at", { ascending: false })
        .limit(1);
      if (cancelled) return;
      if (error) {
        console.error("[free-recall] load failed:", error);
        return;
      }
      if (data && data.length > 0) setPrevious(data[0] as JournalRow);
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, isLoaded, topicSlug, saved]);

  const submit = async () => {
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      if (userId) {
        const { error } = await supabase.from("topic_journal_entries").insert({
          user_id: userId,
          topic_slug: topicSlug,
          kind: "free_recall",
          entry_text: text.trim(),
        });
        if (error) {
          console.error("[free-recall] insert failed:", error);
        }
      }
      setSaved(true);
      setText("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10">
      <Card variant="white" interactive={false}>
        <div className="mb-2 flex items-center gap-2">
          <Badge tone="accent">Free recall</Badge>
          {saved ? <Badge tone="success">Saved</Badge> : null}
        </div>
        <h3 className="text-[22px] font-semibold leading-tight text-[var(--ink)]">
          Before you move on — what would you tell a friend about this topic?
        </h3>
        <p className="mt-2 text-[14px] text-[var(--ink-muted)]">
          Two or three sentences. Writing from memory is the work; perfection isn&apos;t the point.
        </p>

        {previous ? (
          <div className="mt-4 rounded-[14px] bg-[var(--tile)] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--ink-muted)]">
              Last time, you wrote
            </p>
            <p className="mt-2 whitespace-pre-wrap text-[14px] leading-[1.6] text-[var(--ink)]">
              {previous.entry_text}
            </p>
            <p className="mt-2 text-[12px] text-[var(--ink-muted)]">
              {new Date(previous.created_at).toLocaleDateString()}
            </p>
          </div>
        ) : null}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="From memory: what is this topic, why does it matter, and what's the one thing you'd start with?"
          className="mt-4 w-full resize-none rounded-[14px] bg-[var(--tile)] p-4 text-[15px] leading-[1.55] text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />

        <div className="mt-4 flex items-center justify-end">
          <Button
            variant="accent"
            size="md"
            onClick={submit}
          >
            {submitting ? "Saving…" : "Save entry"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
