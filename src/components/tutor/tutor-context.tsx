"use client";

import React from "react";

import type { TutorSurface } from "@/lib/tutor/types";

interface TutorCtxValue {
  surface: TutorSurface;
  isOpen: boolean;
  open: (seed?: string) => void;
  close: () => void;
  seed: string | null;
  _registerSurface: (s: TutorSurface) => void;
  _unregisterSurface: () => void;
}

const TutorCtx = React.createContext<TutorCtxValue | null>(null);

const DEFAULT_SURFACE: TutorSurface = { kind: "global" };

export function useTutor(): TutorCtxValue {
  const ctx = React.useContext(TutorCtx);
  if (!ctx) {
    return {
      surface: DEFAULT_SURFACE,
      isOpen: false,
      open: () => {},
      close: () => {},
      seed: null,
      _registerSurface: () => {},
      _unregisterSurface: () => {},
    };
  }
  return ctx;
}

/**
 * Register the current page's surface descriptor with the global tutor.
 * Auto-deregisters on unmount. Call from a useEffect in each surface page.
 */
export function useTutorSurface(surface: TutorSurface) {
  const ctx = React.useContext(TutorCtx);
  // Stable JSON key so we only re-register when fields actually change.
  const key = React.useMemo(() => JSON.stringify(surface), [surface]);
  React.useEffect(() => {
    if (!ctx) return;
    ctx._registerSurface(surface);
    return () => ctx._unregisterSurface();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

export function TutorProvider({ children }: { children: React.ReactNode }) {
  const [surface, setSurface] = React.useState<TutorSurface>(DEFAULT_SURFACE);
  const [isOpen, setOpen] = React.useState(false);
  const [seed, setSeed] = React.useState<string | null>(null);

  const value = React.useMemo<TutorCtxValue>(
    () => ({
      surface,
      isOpen,
      open: (s) => {
        setSeed(s ?? null);
        setOpen(true);
      },
      close: () => setOpen(false),
      seed,
      _registerSurface: (s) => setSurface(s),
      _unregisterSurface: () => setSurface(DEFAULT_SURFACE),
    }),
    [surface, isOpen, seed],
  );

  return <TutorCtx.Provider value={value}>{children}</TutorCtx.Provider>;
}
