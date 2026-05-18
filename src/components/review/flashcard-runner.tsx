"use client";

/**
 * FlashcardRunner — drives a flashcard review session.
 *
 * Flow:
 *   1. Receive a queue of N cards (already filtered to "due" upstream).
 *   2. Show one at a time. Learner flips the card, picks one of four ratings.
 *   3. Compute the next interval via SM-2-lite, persist to `flashcard_reviews`
 *      for signed-in users (demo user → no-op, matches challenge-tracker).
 *   4. Show summary at the end + trigger the global reflection modal.
 *
 * Persistence is best-effort: a failed write logs to the console but never
 * blocks the UI.
 */

import { useCallback, useMemo, useState } from "react";

import { FlashcardFlipCard } from "@/components/review/flashcard-card";
import { Badge, Button, Card } from "@/components/shared/ui";
import { useReflection } from "@/components/learn/reflection-context";
import { useTutorSurface } from "@/components/tutor/tutor-context";
import { useSupabase } from "@/hooks/useSupabase";
import { nextDueAt, nextInterval } from "@/lib/reviews/flashcard-scheduler";
import type { Flashcard, FlashcardReviewRating } from "@/types/practice";

const RATING_LABEL: Record<FlashcardReviewRating, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

const RATING_HINT: Record<FlashcardReviewRating, string> = {
  again: "Reset to 1d",
  hard: "×1.2 interval",
  good: "×2.5 interval",
  easy: "×4 interval",
};

interface SessionRecord {
  card: Flashcard;
  rating: FlashcardReviewRating;
  intervalDays: number;
}

export function FlashcardRunner({
  cards,
  /**
   * Map from cardId to its most recent interval-days. Used to compute the next
   * step; missing entries default to 1 (first-time card).
   */
  previousIntervalByCard,
  emptyMessage = "No flashcards due — come back tomorrow.",
}: {
  cards: Flashcard[];
  previousIntervalByCard?: Record<string, number>;
  emptyMessage?: string;
}) {
  const { supabase, userId, isSignedIn } = useSupabase();
  const { trigger } = useReflection();

  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [reflectionFired, setReflectionFired] = useState(false);

  const current = cards[index];
  const done = !current;

  // Register surface for the global tutor — only the front of the card is
  // shared (the route also drops cardBack server-side as belt-and-braces).
  useTutorSurface(
    current
      ? {
          kind: "flashcard",
          topicSlug: current.topicSlug,
          cardFront: current.front,
        }
      : { kind: "global" },
  );

  const onRate = useCallback(
    async (rating: FlashcardReviewRating) => {
      if (!current) return;
      const prev = previousIntervalByCard?.[current.id] ?? 1;
      const interval = nextInterval(prev, rating);
      const now = new Date();
      const due = nextDueAt(now, interval);

      setHistory((h) => [...h, { card: current, rating, intervalDays: interval }]);
      setIndex((i) => i + 1);
      setFlipped(false);

      // Persist — best effort. Demo / signed-out users no-op, mirroring the
      // challenge tracker contract.
      if (userId && isSignedIn) {
        try {
          const { error } = await supabase.from("flashcard_reviews").insert({
            user_id: userId,
            card_id: current.id,
            reviewed_at: now.toISOString(),
            rating,
            interval_days: interval,
            next_due_at: due.toISOString(),
          });
          if (error) {
            console.error("[flashcards] review insert failed:", error);
          }
        } catch (err) {
          console.error("[flashcards] review insert threw:", err);
        }
      }
    },
    [current, previousIntervalByCard, supabase, userId, isSignedIn],
  );

  // When the session ends, kick off the global reflection modal exactly once.
  if (done && !reflectionFired && history.length > 0) {
    setReflectionFired(true);
    // Defer to next tick so we don't trigger inside render.
    setTimeout(() => trigger({ kind: "flashcards" }), 0);
  }

  const ratingCounts = useMemo(() => {
    const counts: Record<FlashcardReviewRating, number> = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    };
    for (const h of history) counts[h.rating]++;
    return counts;
  }, [history]);

  if (cards.length === 0) {
    return (
      <Card interactive={false}>
        <p className="text-[15px] leading-6 text-[var(--ink-muted)]">{emptyMessage}</p>
      </Card>
    );
  }

  if (done) {
    return (
      <Card interactive={false} className="flex flex-col gap-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          Session complete
        </p>
        <p className="text-[18px] leading-[1.65] text-[var(--ink)]">
          Reviewed {history.length} card{history.length === 1 ? "" : "s"}.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge tone="danger">{ratingCounts.again} again</Badge>
          <Badge tone="warning">{ratingCounts.hard} hard</Badge>
          <Badge tone="accent">{ratingCounts.good} good</Badge>
          <Badge tone="success">{ratingCounts.easy} easy</Badge>
        </div>
        <p className="text-[14px] leading-6 text-[var(--ink-muted)]">
          Each rating updates the next-due date — easy cards push out by ×4, again resets to a day.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[12px] uppercase tracking-[0.22em] text-[var(--ink-faint)]">
          Card {index + 1} of {cards.length}
        </p>
        <Badge>{current.topicSlug}</Badge>
      </div>

      <FlashcardFlipCard
        card={current}
        flipped={flipped}
        onFlip={() => setFlipped((f) => !f)}
      />

      <Card interactive={false} className="flex flex-col gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          Rate your recall
        </p>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {(["again", "hard", "good", "easy"] as FlashcardReviewRating[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onRate(r)}
              disabled={!flipped}
              className={`rounded-full px-4 py-3 text-[14px] font-medium transition ${
                flipped
                  ? "bg-[var(--tile)] text-[var(--ink)] hover:bg-[var(--tile-deep)] hover:scale-[1.02] active:scale-[0.99]"
                  : "pointer-events-none bg-[var(--tile)] text-[var(--ink-faint)] opacity-60"
              }`}
              aria-label={`Rate ${RATING_LABEL[r]} (${RATING_HINT[r]})`}
            >
              <span className="block">{RATING_LABEL[r]}</span>
              <span className="block text-[11px] font-normal text-[var(--ink-faint)]">
                {RATING_HINT[r]}
              </span>
            </button>
          ))}
        </div>
        {!flipped ? (
          <p className="text-[13px] text-[var(--ink-faint)]">
            Flip the card to reveal the answer, then rate yourself.
          </p>
        ) : null}
      </Card>

      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIndex((i) => i + 1);
            setFlipped(false);
          }}
        >
          Skip this card
        </Button>
      </div>
    </div>
  );
}
