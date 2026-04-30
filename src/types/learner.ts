import type { CurriculumTopic, Phase } from "@/types/domain";

export type LearnerTopicStatus =
  | "strong"
  | "active"
  | "needs_work"
  | "decaying"
  | "blocked"
  | "locked";

export interface TopicSummary {
  topic: CurriculumTopic;
  status: LearnerTopicStatus;
  proficiencyScore: number;
  blockedBy: CurriculumTopic[];
  unlocks: CurriculumTopic[];
  subtopicSlugs: string[];
}

export interface PhaseProgress {
  phase: Phase;
  topicCount: number;
  completedCount: number;
  decayingCount: number;
  blockedCount: number;
  averageProficiency: number;
  topicSlugs: string[];
}

export interface LearnerDashboardData {
  summaries: TopicSummary[];
  phaseProgress: PhaseProgress[];
  decaying: TopicSummary[];
  needsWork: TopicSummary[];
  recentlyImproved: TopicSummary[];
  overallProficiency: number;
  topicsCompleted: number;
  topicsTotal: number;
  totalMinutesEstimated: number;
}
