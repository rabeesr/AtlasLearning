/**
 * SM-2-lite scheduler — minimal spaced-repetition step computation.
 *
 * The repo doesn't carry an ease factor per card; we apply a fixed multiplier
 * per rating instead. Rationale: simpler to reason about, gets 80% of FSRS at
 * 5% of the complexity. Full FSRS is captured in the deferred-work section.
 *
 * Caps the interval at 90 days so a single "easy" streak can't push a card
 * out of sight forever — a learner who hasn't seen a card in 3 months almost
 * always benefits from re-testing.
 */

import type { FlashcardReviewRating } from "@/types/practice";

export const MAX_INTERVAL_DAYS = 90;

export function nextInterval(
  previousIntervalDays: number,
  rating: FlashcardReviewRating,
): number {
  if (rating === "again") return 1;
  const factor = rating === "hard" ? 1.2 : rating === "good" ? 2.5 : 4;
  const prev = Math.max(1, previousIntervalDays || 1);
  return Math.min(MAX_INTERVAL_DAYS, Math.max(1, Math.round(prev * factor)));
}

export function nextDueAt(
  reviewedAt: Date,
  intervalDays: number,
): Date {
  return new Date(reviewedAt.getTime() + intervalDays * 86_400_000);
}
