"use client";

import { useEffect, useState } from "react";

import { useSupabase } from "@/hooks/useSupabase";

/**
 * Returns the set of challenge slugs the signed-in user has solved (any
 * attempt with `completed_at` set — recordRun only sets that when every test
 * passes). For anonymous users returns an empty Set without making a request,
 * so callers can render badge-less and skip the round-trip.
 */
export function useSolvedChallenges(): {
  solved: Set<string>;
  isSignedIn: boolean;
  loaded: boolean;
} {
  const { supabase, userId, isLoaded } = useSupabase();
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      setSolved(new Set());
      setLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("challenge_attempts")
          .select("challenge_slug")
          .eq("user_id", userId)
          .not("completed_at", "is", null);
        if (cancelled) return;
        if (error) {
          setLoaded(true);
          return;
        }
        const next = new Set<string>();
        for (const row of (data ?? []) as { challenge_slug: string }[]) {
          if (row.challenge_slug) next.add(row.challenge_slug);
        }
        setSolved(next);
        setLoaded(true);
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase, userId, isLoaded]);

  return { solved, isSignedIn: Boolean(userId), loaded };
}
