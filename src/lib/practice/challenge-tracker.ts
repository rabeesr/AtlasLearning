"use client";

/**
 * Challenge attempt persistence hook.
 *
 * Signed-in users get a row in `public.challenge_attempts` per attempt; runs
 * upsert results + code; revealing the solution flips a flag. Anonymous /
 * demo users get a working local attempt id but writes are skipped without
 * throwing — mirrors the quiz tracker contract.
 */

import { useCallback, useMemo } from "react";

import { useSupabase } from "@/hooks/useSupabase";
import type { ChallengeTestResult } from "@/types/practice";

export interface ChallengeTracker {
  startAttempt(): Promise<string>;
  recordRun(
    attemptId: string,
    results: ChallengeTestResult[],
    userCode: string,
  ): Promise<void>;
  markRevealed(attemptId: string): Promise<void>;
}

function newAttemptId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `challenge-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function useChallengeTracker(challengeSlug: string): ChallengeTracker {
  const { supabase, userId } = useSupabase();

  const startAttempt = useCallback(async () => {
    const attemptId = newAttemptId();
    if (!userId) return attemptId;
    try {
      const { error } = await supabase.from("challenge_attempts").insert({
        id: attemptId,
        user_id: userId,
        challenge_slug: challengeSlug,
        started_at: new Date().toISOString(),
      });
      if (error) {
        console.error("[challenge-tracker] startAttempt insert failed:", error);
      }
    } catch (err) {
      console.error("[challenge-tracker] startAttempt threw:", err);
    }
    return attemptId;
  }, [challengeSlug, supabase, userId]);

  const recordRun = useCallback(
    async (
      attemptId: string,
      results: ChallengeTestResult[],
      userCode: string,
    ) => {
      if (!userId) return;
      const allPassed = results.length > 0 && results.every((r) => r.passed);
      try {
        const { error } = await supabase
          .from("challenge_attempts")
          .update({
            last_results: results,
            last_code: userCode,
            completed_at: allPassed ? new Date().toISOString() : null,
          })
          .eq("id", attemptId);
        if (error) {
          console.error("[challenge-tracker] recordRun update failed:", error);
        }
      } catch (err) {
        console.error("[challenge-tracker] recordRun threw:", err);
      }
    },
    [supabase, userId],
  );

  const markRevealed = useCallback(
    async (attemptId: string) => {
      if (!userId) return;
      try {
        const { error } = await supabase
          .from("challenge_attempts")
          .update({ revealed_solution: true })
          .eq("id", attemptId);
        if (error) {
          console.error("[challenge-tracker] markRevealed update failed:", error);
        }
      } catch (err) {
        console.error("[challenge-tracker] markRevealed threw:", err);
      }
    },
    [supabase, userId],
  );

  return useMemo(
    () => ({ startAttempt, recordRun, markRevealed }),
    [startAttempt, recordRun, markRevealed],
  );
}
