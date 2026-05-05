"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  QuestionAttempt,
  QuizAttemptSummary,
} from "@/types/practice";

/**
 * Tracker abstraction. The in-session implementation lives in this file;
 * a Supabase-backed implementation can replace `InSessionQuizTrackerProvider`
 * without changing any consuming component.
 */
export interface QuizTracker {
  startAttempt: (topicSlug: string) => string;
  recordQuestion: (attemptId: string, attempt: QuestionAttempt) => void;
  completeAttempt: (attemptId: string) => void;
  getCurrentAttempt: (topicSlug: string) => QuizAttemptSummary | null;
  resetTopic: (topicSlug: string) => void;
}

export const QuizTrackerContext = createContext<QuizTracker | null>(null);

export function useQuizTracker(): QuizTracker {
  const ctx = useContext(QuizTrackerContext);
  if (!ctx) throw new Error("useQuizTracker must be used inside a QuizTrackerProvider");
  return ctx;
}

export function newAttemptId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `attempt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function InSessionQuizTrackerProvider({ children }: { children: ReactNode }) {
  const [attemptsByTopic, setAttemptsByTopic] = useState<Record<string, QuizAttemptSummary>>({});

  const startAttempt = useCallback((topicSlug: string) => {
    const attemptId = newAttemptId();
    setAttemptsByTopic((prev) => ({
      ...prev,
      [topicSlug]: {
        attemptId,
        topicSlug,
        attempts: [],
        startedAt: Date.now(),
      },
    }));
    return attemptId;
  }, []);

  const recordQuestion = useCallback((attemptId: string, attempt: QuestionAttempt) => {
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
  }, []);

  const completeAttempt = useCallback((attemptId: string) => {
    setAttemptsByTopic((prev) => {
      const next = { ...prev };
      for (const slug of Object.keys(next)) {
        if (next[slug].attemptId === attemptId) {
          next[slug] = { ...next[slug], completedAt: Date.now() };
        }
      }
      return next;
    });
  }, []);

  const getCurrentAttempt = useCallback(
    (topicSlug: string) => attemptsByTopic[topicSlug] ?? null,
    [attemptsByTopic],
  );

  const resetTopic = useCallback((topicSlug: string) => {
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
