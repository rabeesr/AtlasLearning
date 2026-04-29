export interface CurrentUser {
  id: string;
  displayName: string;
  email?: string;
  timezone: string;
}

export type TopicStatus =
  | "locked"
  | "available"
  | "in_progress"
  | "completed"
  | "decaying";

export interface TopicProgress {
  userId: string;
  topicSlug: string;
  status: TopicStatus;
  proficiencyScore: number;
  updatedAt: string;
}
