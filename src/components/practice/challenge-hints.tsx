"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/shared/ui";

/**
 * Progressive hints. Closed by default. Each click reveals the next hint and
 * persists the revealed count to localStorage keyed by challenge slug, so the
 * reveal state survives reloads. If `hints` is empty/undefined the parent
 * should not render this — but we also guard internally.
 */
export function ChallengeHints({
  challengeSlug,
  hints,
}: {
  challengeSlug: string;
  hints: string[];
}) {
  const storageKey = `atlas:hints:${challengeSlug}`;
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const n = parseInt(raw, 10);
        if (Number.isFinite(n) && n > 0) {
          setRevealed(Math.min(n, hints.length));
          setOpen(true);
        }
      }
    } catch {
      // Ignore — localStorage blocked. We just don't persist.
    }
    setHydrated(true);
  }, [storageKey, hints.length]);

  function persist(n: number) {
    try {
      window.localStorage.setItem(storageKey, String(n));
    } catch {
      // Ignore.
    }
  }

  function openFirst() {
    setOpen(true);
    if (revealed === 0) {
      setRevealed(1);
      persist(1);
    }
  }

  function next() {
    const n = Math.min(revealed + 1, hints.length);
    setRevealed(n);
    persist(n);
  }

  function reset() {
    setRevealed(0);
    setOpen(false);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore.
    }
  }

  if (!hints || hints.length === 0) return null;
  // Avoid hydration mismatch — render closed state until hydrated.
  if (!hydrated) {
    return (
      <div className="mt-6">
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--tile)] px-4 text-[13px] font-medium text-[var(--ink-muted)]"
          disabled
        >
          <BulbIcon />
          Hints ({hints.length} available)
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3">
      {!open ? (
        <button
          type="button"
          onClick={openFirst}
          className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--tile)] px-4 text-[13px] font-medium text-[var(--ink)] transition-all duration-200 ease-out hover:bg-[var(--tile-deep)] hover:-translate-y-0.5"
        >
          <BulbIcon />
          Hints ({hints.length} available)
        </button>
      ) : (
        <div className="space-y-2.5">
          {hints.slice(0, revealed).map((h, i) => (
            <div
              key={i}
              className="animate-[fadeInUp_300ms_ease-out] rounded-[14px] bg-[#F5F5F7] px-4 py-3"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                Hint {i + 1} of {hints.length}
              </p>
              <p className="mt-1.5 text-[14px] leading-6 text-[var(--ink)]">
                {h}
              </p>
            </div>
          ))}
          <div className="flex flex-wrap items-center gap-2">
            {revealed < hints.length ? (
              <Button onClick={next} variant="secondary" size="sm">
                Show next hint
              </Button>
            ) : (
              <span className="text-[12px] text-[var(--ink-faint)]">
                All hints revealed.
              </span>
            )}
            <button
              type="button"
              onClick={reset}
              className="text-[12px] text-[var(--ink-faint)] hover:text-[var(--ink-muted)]"
            >
              Hide hints
            </button>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function BulbIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
    >
      <path d="M6 13h4M6.5 11h3M5 8.5a3 3 0 1 1 6 0c0 1-.5 1.5-1 2H6c-.5-.5-1-1-1-2Z" />
    </svg>
  );
}
