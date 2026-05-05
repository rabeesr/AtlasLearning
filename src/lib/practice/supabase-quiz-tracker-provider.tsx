"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";

import { useSupabase } from "@/hooks/useSupabase";
import {
  QuizTrackerContext,
  newAttemptId,
  type QuizTracker,
} from "@/lib/practice/quiz-tracker";
import type { QuestionAttempt, QuizAttemptSummary } from "@/types/practice";

/**
 * Supabase-backed quiz tracker. Each `startAttempt` inserts a `quiz_attempts`
 * row using a client-generated UUID; that UUID is the authoritative attemptId
 * everywhere (local state, child question rows). Per-question recording
 * upserts a `question_attempts` row so reloading the page can later resume an
 * in-flight attempt. Persistence is fire-and-forget — UI never waits.
 */
export function SupabaseQuizTrackerProvider({ children }: { children: ReactNode }) {
  const { supabase, userId } = useSupabase();
  const [attemptsByTopic, setAttemptsByTopic] = useState<Record<string, QuizAttemptSummary>>({});

  const startAttempt = useCallback(
    (topicSlug: string) => {
      const attemptId = newAttemptId();
      const startedAt = Date.now();
      setAttemptsByTopic((prev) => ({
        ...prev,
        [topicSlug]: { attemptId, topicSlug, attempts: [], startedAt },
      }));
      if (userId) {
        void (async () => {
          const { error } = await supabase.from("quiz_attempts").insert({
            id: attemptId,
            user_id: userId,
            topic_slug: topicSlug,
            started_at: new Date(startedAt).toISOString(),
          });
          if (error) console.error("[supabase-quiz] insert attempt failed:", error);
        })();
      }
      return attemptId;
    },
    [supabase, userId],
  );

  const recordQuestion = useCallback(
    (attemptId: string, attempt: QuestionAttempt) => {
      setAttemptsByTopic((prev) => {
        const next = { ...prev };
        for (const slug of Object.keys(next)) {
          const summary = next[slug];
          if (summary.attemptId !== attemptId) continue;
          const filtered = summary.attempts.filter((a) => a.questionId !== attempt.questionId);
          next[slug] = { ...summary, attempts: [...filtered, attempt] };
        }
        return next;
      });

      if (userId) {
        void (async () => {
          const { error } = await supabase.from("question_attempts").upsert(
            {
              attempt_id: attemptId,
              user_id: userId,
              question_id: attempt.questionId,
              result: attempt.result,
              selected_choice: attempt.selectedChoice ?? null,
            },
            { onConflict: "attempt_id,question_id" },
          );
          if (error) console.error("[supabase-quiz] upsert question failed:", error);
        })();
      }
    },
    [supabase, userId],
  );

  const completeAttempt = useCallback(
    (attemptId: string) => {
      const completedAt = Date.now();
      setAttemptsByTopic((prev) => {
        const next = { ...prev };
        for (const slug of Object.keys(next)) {
          if (next[slug].attemptId === attemptId) {
            next[slug] = { ...next[slug], completedAt };
          }
        }
        return next;
      });
      if (userId) {
        void (async () => {
          const { error } = await supabase
            .from("quiz_attempts")
            .update({ completed_at: new Date(completedAt).toISOString() })
            .eq("id", attemptId);
          if (error) console.error("[supabase-quiz] complete attempt failed:", error);
        })();
      }
    },
    [supabase, userId],
  );

  const getCurrentAttempt = useCallback(
    (topicSlug: string) => attemptsByTopic[topicSlug] ?? null,
    [attemptsByTopic],
  );

  const resetTopic = useCallback((topicSlug: string) => {
    // Local-only — historical attempts stay in Supabase for stats. Reset
    // here just clears the active in-memory attempt so the player can
    // start fresh.
    setAttemptsByTopic((prev) => {
      const next = { ...prev };
      delete next[topicSlug];
      return next;
    });
  }, []);

  const value = useMemo<QuizTracker>(
    () => ({ startAttempt, recordQuestion, completeAttempt, getCurrentAttempt, resetTopic }),
    [startAttempt, recordQuestion, completeAttempt, getCurrentAttempt, resetTopic],
  );

  return <QuizTrackerContext.Provider value={value}>{children}</QuizTrackerContext.Provider>;
}
