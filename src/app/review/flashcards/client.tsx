"use client";

/**
 * Client wrapper for the flashcard review page.
 *
 * Owns the "what's due" calculation:
 *   1. On mount, pull every review row for the user from `flashcard_reviews`.
 *   2. Per card, find the most recent row → its `next_due_at` and `interval_days`.
 *   3. A card is "due" if it has never been reviewed OR `next_due_at <= now`.
 *   4. Pick up to 20 due cards (oldest-due first). If nothing is due AND the
 *      user is signed in, show the empty state; if no history yet (e.g. demo),
 *      surface up to 20 random cards so the page is useful immediately.
 *
 * All persistence happens inside FlashcardRunner.
 */

import { useEffect, useMemo, useState } from "react";

import { FlashcardRunner } from "@/components/review/flashcard-runner";
import { useSupabase } from "@/hooks/useSupabase";
import type { Flashcard } from "@/types/practice";

const SESSION_CAP = 20;

interface ReviewRow {
  card_id: string;
  next_due_at: string;
  interval_days: number;
  reviewed_at: string;
}

interface CardState {
  /** Latest review row for this card, if any. */
  latest?: ReviewRow;
}

export function FlashcardReviewClient({
  allCards,
  scope,
}: {
  allCards: Flashcard[];
  scope: "all" | string;
}) {
  const { supabase, userId, isLoaded } = useSupabase();
  const [stateByCard, setStateByCard] = useState<Record<string, CardState>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isLoaded) return;
      if (!userId) {
        setStateByCard({});
        setLoaded(true);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("flashcard_reviews")
          .select("card_id, next_due_at, interval_days, reviewed_at")
          .eq("user_id", userId)
          .order("reviewed_at", { ascending: false });
        if (error) {
          console.error("[flashcards] history load failed:", error);
        }
        const next: Record<string, CardState> = {};
        for (const row of (data ?? []) as ReviewRow[]) {
          if (next[row.card_id]) continue; // sorted desc — first hit wins
          next[row.card_id] = { latest: row };
        }
        if (!cancelled) setStateByCard(next);
      } catch (err) {
        console.error("[flashcards] history threw:", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, isLoaded]);

  const { sessionCards, previousIntervalByCard, fallbackUsed } = useMemo(() => {
    const now = Date.now();
    const due: { card: Flashcard; dueAt: number }[] = [];
    for (const c of allCards) {
      const latest = stateByCard[c.id]?.latest;
      if (!latest) {
        due.push({ card: c, dueAt: 0 });
        continue;
      }
      const dueAt = new Date(latest.next_due_at).getTime();
      if (dueAt <= now) due.push({ card: c, dueAt });
    }
    due.sort((a, b) => a.dueAt - b.dueAt);

    let chosen = due.slice(0, SESSION_CAP).map((d) => d.card);
    let fallback = false;
    if (chosen.length === 0 && allCards.length > 0) {
      // Nothing due but we have cards — give the learner *something* to do.
      chosen = allCards.slice(0, SESSION_CAP);
      fallback = true;
    }

    const prev: Record<string, number> = {};
    for (const [cardId, st] of Object.entries(stateByCard)) {
      if (st.latest) prev[cardId] = st.latest.interval_days;
    }
    return { sessionCards: chosen, previousIntervalByCard: prev, fallbackUsed: fallback };
  }, [allCards, stateByCard]);

  if (!loaded) {
    return (
      <p className="text-[14px] text-[var(--ink-muted)]">Loading your review queue…</p>
    );
  }

  const emptyMessage =
    scope === "all"
      ? "No flashcards in the library yet."
      : "No flashcards in this deck yet.";

  return (
    <div className="flex flex-col gap-4">
      {fallbackUsed ? (
        <p className="text-[13px] text-[var(--ink-faint)]">
          Nothing&apos;s strictly due yet — showing a starter set so you can practice anyway.
        </p>
      ) : null}
      <FlashcardRunner
        cards={sessionCards}
        previousIntervalByCard={previousIntervalByCard}
        emptyMessage={emptyMessage}
      />
    </div>
  );
}
