"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { useSupabase } from "@/hooks/useSupabase";
import {
  EMPTY_ENGAGEMENT,
  EngagementContext,
  toggleArrayMembership,
  type EngagementTracker,
} from "@/lib/progress/proficiency-tracker";
import type { TopicEngagement } from "@/types/proficiency";

interface EngagementRow {
  user_id: string;
  topic_slug: string;
  checked_objectives: string[];
  checked_concepts: string[];
  completed_challenges: string[];
  completed_projects: string[];
}

function rowToEngagement(row: EngagementRow): TopicEngagement {
  return {
    topicSlug: row.topic_slug,
    checkedObjectives: row.checked_objectives ?? [],
    checkedConcepts: row.checked_concepts ?? [],
    completedChallenges: row.completed_challenges ?? [],
    completedProjects: row.completed_projects ?? [],
  };
}

function engagementToRow(userId: string, e: TopicEngagement): EngagementRow {
  return {
    user_id: userId,
    topic_slug: e.topicSlug,
    checked_objectives: e.checkedObjectives,
    checked_concepts: e.checkedConcepts,
    completed_challenges: e.completedChallenges,
    completed_projects: e.completedProjects,
  };
}

/**
 * Supabase-backed engagement tracker. Hydrates the user's `topic_engagement`
 * rows on mount, then writes through on every toggle. Failures log but do
 * not roll back the optimistic UI update — the UI stays responsive even on
 * transient network blips, and the next successful upsert reconciles state.
 */
export function SupabaseEngagementProvider({ children }: { children: ReactNode }) {
  const { supabase, userId, isLoaded } = useSupabase();
  const [byTopic, setByTopic] = useState<Record<string, TopicEngagement>>({});
  const hydratedFor = useRef<string | null>(null);

  // Hydrate from Supabase on mount / on user change.
  useEffect(() => {
    if (!isLoaded || !userId) return;
    if (hydratedFor.current === userId) return;
    hydratedFor.current = userId;

    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("topic_engagement")
        .select(
          "user_id, topic_slug, checked_objectives, checked_concepts, completed_challenges, completed_projects",
        );
      if (cancelled) return;
      if (error) {
        console.error("[supabase-engagement] hydrate failed:", error);
        return;
      }
      const next: Record<string, TopicEngagement> = {};
      for (const row of (data ?? []) as EngagementRow[]) {
        next[row.topic_slug] = rowToEngagement(row);
      }
      setByTopic(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [supabase, userId, isLoaded]);

  const persist = useCallback(
    async (topicSlug: string, engagement: TopicEngagement) => {
      if (!userId) return;
      const { error } = await supabase
        .from("topic_engagement")
        .upsert(engagementToRow(userId, engagement), {
          onConflict: "user_id,topic_slug",
        });
      if (error) {
        console.error(`[supabase-engagement] upsert failed for ${topicSlug}:`, error);
      }
    },
    [supabase, userId],
  );

  const updateTopic = useCallback(
    (topicSlug: string, updater: (prev: TopicEngagement) => TopicEngagement) => {
      setByTopic((prev) => {
        const current = prev[topicSlug] ?? EMPTY_ENGAGEMENT(topicSlug);
        const next = updater(current);
        // Fire-and-forget; UI does not wait on persistence.
        void persist(topicSlug, next);
        return { ...prev, [topicSlug]: next };
      });
    },
    [persist],
  );

  const getEngagement = useCallback(
    (topicSlug: string) => byTopic[topicSlug] ?? EMPTY_ENGAGEMENT(topicSlug),
    [byTopic],
  );

  const toggleObjective = useCallback(
    (topicSlug: string, key: string) =>
      updateTopic(topicSlug, (e) => ({
        ...e,
        checkedObjectives: toggleArrayMembership(e.checkedObjectives, key),
      })),
    [updateTopic],
  );

  const toggleConcept = useCallback(
    (topicSlug: string, key: string) =>
      updateTopic(topicSlug, (e) => ({
        ...e,
        checkedConcepts: toggleArrayMembership(e.checkedConcepts, key),
      })),
    [updateTopic],
  );

  const toggleChallenge = useCallback(
    (topicSlug: string, slug: string) =>
      updateTopic(topicSlug, (e) => ({
        ...e,
        completedChallenges: toggleArrayMembership(e.completedChallenges, slug),
      })),
    [updateTopic],
  );

  const toggleProject = useCallback(
    (topicSlug: string, slug: string) =>
      updateTopic(topicSlug, (e) => ({
        ...e,
        completedProjects: toggleArrayMembership(e.completedProjects, slug),
      })),
    [updateTopic],
  );

  const resetTopic = useCallback(
    async (topicSlug: string) => {
      setByTopic((prev) => {
        const next = { ...prev };
        delete next[topicSlug];
        return next;
      });
      if (!userId) return;
      const { error } = await supabase
        .from("topic_engagement")
        .delete()
        .match({ user_id: userId, topic_slug: topicSlug });
      if (error) {
        console.error(`[supabase-engagement] delete failed for ${topicSlug}:`, error);
      }
    },
    [supabase, userId],
  );

  const value = useMemo<EngagementTracker>(
    () => ({
      getEngagement,
      toggleObjective,
      toggleConcept,
      toggleChallenge,
      toggleProject,
      resetTopic,
    }),
    [getEngagement, toggleObjective, toggleConcept, toggleChallenge, toggleProject, resetTopic],
  );

  return <EngagementContext.Provider value={value}>{children}</EngagementContext.Provider>;
}
