"use client";

import React from "react";

import { ReflectionModal } from "@/components/learn/reflection-modal";

export type ReflectionKind = "quiz" | "mixed-session" | "flashcards" | "challenge";

export interface ReflectionTriggerOpts {
  kind: ReflectionKind;
  topicSlug?: string;
}

interface ReflectionCtxValue {
  trigger: (opts: ReflectionTriggerOpts) => void;
}

const ReflectionCtx = React.createContext<ReflectionCtxValue | null>(null);

/**
 * Hook every consumer should use to surface the post-session reflection
 * modal. Safe to call when no provider is mounted — falls back to a no-op
 * trigger so unit tests, error boundaries, and isolated routes don't crash.
 */
export function useReflection(): ReflectionCtxValue {
  const ctx = React.useContext(ReflectionCtx);
  return ctx ?? { trigger: () => {} };
}

/**
 * ReflectionProvider — mount near the top of the tree (in `AuthAwareProviders`
 * or `RootLayout`) so any client route can call `useReflection().trigger({...})`
 * at the end of a quiz / flashcard / challenge / mixed-review session.
 */
export function ReflectionProvider({ children }: { children: React.ReactNode }) {
  const [opts, setOpts] = React.useState<ReflectionTriggerOpts | null>(null);

  const value = React.useMemo<ReflectionCtxValue>(
    () => ({
      trigger: (next) => setOpts(next),
    }),
    [],
  );

  return (
    <ReflectionCtx.Provider value={value}>
      {children}
      {opts ? (
        <ReflectionModal opts={opts} onClose={() => setOpts(null)} />
      ) : null}
    </ReflectionCtx.Provider>
  );
}
