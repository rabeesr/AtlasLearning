"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { TopicEngagement } from "@/types/proficiency";

/**
 * Engagement tracker abstraction. The in-session implementation lives below;
 * a Supabase-backed implementation can satisfy the same interface and slot
 * into `RootLayout` without changing any consuming component.
 */
export interface EngagementTracker {
  getEngagement: (topicSlug: string) => TopicEngagement;
  toggleObjective: (topicSlug: string, key: string) => void;
  toggleConcept: (topicSlug: string, key: string) => void;
  toggleChallenge: (topicSlug: string, slug: string) => void;
  toggleProject: (topicSlug: string, slug: string) => void;
  resetTopic: (topicSlug: string) => void;
}

export const EMPTY_ENGAGEMENT = (slug: string): TopicEngagement => ({
  topicSlug: slug,
  checkedObjectives: [],
  checkedConcepts: [],
  completedChallenges: [],
  completedProjects: [],
});

export const EngagementContext = createContext<EngagementTracker | null>(null);

export function useEngagementTracker(): EngagementTracker {
  const ctx = useContext(EngagementContext);
  if (!ctx) {
    throw new Error("useEngagementTracker must be used inside an EngagementTrackerProvider");
  }
  return ctx;
}

export function toggleArrayMembership(arr: string[], key: string): string[] {
  return arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key];
}

const toggle = toggleArrayMembership;

export function InSessionEngagementProvider({ children }: { children: ReactNode }) {
  const [byTopic, setByTopic] = useState<Record<string, TopicEngagement>>({});

  const getEngagement = useCallback(
    (topicSlug: string) => byTopic[topicSlug] ?? EMPTY_ENGAGEMENT(topicSlug),
    [byTopic],
  );

  const updateTopic = useCallback(
    (topicSlug: string, updater: (prev: TopicEngagement) => TopicEngagement) => {
      setByTopic((prev) => {
        const current = prev[topicSlug] ?? EMPTY_ENGAGEMENT(topicSlug);
        return { ...prev, [topicSlug]: updater(current) };
      });
    },
    [],
  );

  const toggleObjective = useCallback(
    (topicSlug: string, key: string) =>
      updateTopic(topicSlug, (e) => ({
        ...e,
        checkedObjectives: toggle(e.checkedObjectives, key),
      })),
    [updateTopic],
  );

  const toggleConcept = useCallback(
    (topicSlug: string, key: string) =>
      updateTopic(topicSlug, (e) => ({
        ...e,
        checkedConcepts: toggle(e.checkedConcepts, key),
      })),
    [updateTopic],
  );

  const toggleChallenge = useCallback(
    (topicSlug: string, slug: string) =>
      updateTopic(topicSlug, (e) => ({
        ...e,
        completedChallenges: toggle(e.completedChallenges, slug),
      })),
    [updateTopic],
  );

  const toggleProject = useCallback(
    (topicSlug: string, slug: string) =>
      updateTopic(topicSlug, (e) => ({
        ...e,
        completedProjects: toggle(e.completedProjects, slug),
      })),
    [updateTopic],
  );

  const resetTopic = useCallback(
    (topicSlug: string) =>
      setByTopic((prev) => {
        const next = { ...prev };
        delete next[topicSlug];
        return next;
      }),
    [],
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
