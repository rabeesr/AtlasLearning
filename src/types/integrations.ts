import type { TopicProgress } from "@/types/user";

export interface ProgressRepository {
  listTopicProgress(userId: string): Promise<TopicProgress[]>;
}

export interface AIProvider {
  isConfigured(): boolean;
}

export interface NotificationProvider {
  isConfigured(): boolean;
}
