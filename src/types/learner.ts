import type { CurriculumTopic } from "@/types/domain";

export type LearnerTopicStatus =
  | "strong"
  | "active"
  | "needs_work"
  | "decaying"
  | "blocked";

export type TopicActionKey = "learn" | "quiz" | "challenge" | "review";

export type TopicActionAvailability =
  | "available"
  | "blocked"
  | "not_authored"
  | "completed"
  | "started";

export interface TopicActionState {
  key: TopicActionKey;
  label: string;
  href: string;
  status: TopicActionAvailability;
  detail: string;
}

export interface PillarProgress {
  pillarSlug: string;
  pillarName: string;
  topicCount: number;
  completionCount: number;
  blockedCount: number;
  weakCount: number;
  activeCount: number;
  strongCount: number;
  progressPercent: number;
}

export interface DashboardTopicSummary {
  topic: CurriculumTopic;
  pillarSlug: string;
  pillarName: string;
  status: LearnerTopicStatus;
  blockedBy: CurriculumTopic[];
  unlocks: CurriculumTopic[];
  availableActions: TopicActionState[];
  progressPercent: number;
}

export interface PracticeCenterFilter {
  selectedPillar: string | null;
  selectedTopic: string | null;
  selectedStatus: LearnerTopicStatus | "all";
  readiness: "all" | "ready" | "blocked";
  mode: "all" | "due" | "ready_now" | "started";
}

export interface NextActionItem {
  id: string;
  kind: TopicActionKey;
  title: string;
  detail: string;
  topicSlug: string;
  pillarSlug: string;
  href: string;
  priority: number;
}

export interface LearnerDashboardData {
  summaries: DashboardTopicSummary[];
  pillars: PillarProgress[];
  nextActions: NextActionItem[];
  statusCounts: Record<LearnerTopicStatus, number>;
  completionPercent: number;
  focusTopic: DashboardTopicSummary | null;
}
