import type { LearnerTopicStatus } from "@/types/learner";

export const STATUS_LABEL: Record<LearnerTopicStatus, string> = {
  strong: "Strong",
  active: "Active",
  needs_work: "Needs work",
  decaying: "Decaying",
  blocked: "Blocked",
  locked: "Locked",
};

export const STATUS_TONE: Record<
  LearnerTopicStatus,
  "neutral" | "accent" | "success" | "warning" | "danger"
> = {
  strong: "success",
  active: "accent",
  needs_work: "warning",
  decaying: "danger",
  blocked: "neutral",
  locked: "neutral",
};
