"use client";

import { useEffect, useState } from "react";

import { Badge, Card } from "@/components/shared/ui";
import { useSupabase } from "@/hooks/useSupabase";
import type { ChallengeTestResult } from "@/types/practice";

interface AttemptRow {
  id: string;
  started_at: string;
  completed_at: string | null;
  revealed_solution: boolean | null;
  last_results: ChallengeTestResult[] | null;
}

/**
 * Last 10 attempts for the current challenge by the signed-in user. Hidden
 * entirely for anonymous users (no login-prompt empty state — keeps the page
 * clean per spec). Re-fetches when `refreshKey` changes so the parent runner
 * can bump it after a run.
 */
export function ChallengeAttemptsPanel({
  challengeSlug,
  totalTests,
  refreshKey,
}: {
  challengeSlug: string;
  totalTests: number;
  refreshKey: number;
}) {
  const { supabase, userId, isLoaded } = useSupabase();
  const [rows, setRows] = useState<AttemptRow[] | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    if (!isLoaded || !userId) {
      setRows(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("challenge_attempts")
          .select("id, started_at, completed_at, revealed_solution, last_results")
          .eq("challenge_slug", challengeSlug)
          .eq("user_id", userId)
          .order("started_at", { ascending: false })
          .limit(10);
        if (cancelled) return;
        if (error) {
          setErrored(true);
          return;
        }
        setRows((data ?? []) as AttemptRow[]);
      } catch {
        if (!cancelled) setErrored(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, isLoaded, challengeSlug, refreshKey]);

  // Hide entirely for anonymous/demo users or on error.
  if (!isLoaded || !userId || errored) return null;
  // Hide while loading the first batch, then show even if empty (with a
  // tiny note) — so users know the feature exists.
  if (rows === null) return null;

  return (
    <Card interactive={false}>
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          Your attempts
        </p>
        <p className="text-[13px] text-[var(--ink-faint)]">
          {rows.length === 0
            ? "No attempts yet"
            : `Last ${rows.length} of ${rows.length}`}
        </p>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-[13px] text-[var(--ink-faint)]">
          Run the code to record your first attempt.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {rows.map((row, idx) => {
            const passed =
              row.last_results?.filter((r) => r.passed).length ?? 0;
            const total = row.last_results?.length ?? totalTests;
            const allPassed = total > 0 && passed === total;
            const highlight = idx === 0;
            return (
              <li
                key={row.id}
                className={`flex flex-wrap items-center gap-3 rounded-[14px] px-4 py-3 ${
                  highlight
                    ? "bg-[var(--accent-soft)]"
                    : "bg-white"
                }`}
              >
                <span
                  aria-hidden
                  className={`inline-flex h-2.5 w-2.5 flex-none rounded-full ${
                    allPassed
                      ? "bg-[var(--success)]"
                      : passed > 0
                        ? "bg-[var(--warning)]"
                        : "bg-[var(--ink-faint)]"
                  }`}
                />
                <span className="text-[13px] text-[var(--ink)]">
                  {relativeTime(row.started_at)}
                </span>
                <span className="font-mono text-[12px] tabular-nums text-[var(--ink-muted)]">
                  {passed} / {total} passing
                </span>
                <span className="ml-auto flex gap-1.5">
                  {allPassed ? <Badge tone="success">Solved</Badge> : null}
                  {row.revealed_solution ? (
                    <Badge tone="neutral">Revealed</Badge>
                  ) : null}
                  {highlight ? <Badge tone="accent">Latest</Badge> : null}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return iso;
  const diff = Date.now() - then;
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d} day${d === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString();
}
