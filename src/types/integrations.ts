import type { TopicProgress } from "@/types/user";

export interface ProgressRepository {
  listTopicProgress(userId: string): Promise<TopicProgress[]>;
}

export interface QuizRepository {
  listByTopic(topicSlug: string): Promise<Array<{ id: string; prompt: string }>>;
}

export interface ChallengeRepository {
  listByTopic(topicSlug: string): Promise<Array<{ slug: string; title: string }>>;
}

export interface AIProvider {
  isConfigured(): boolean;
}

export interface NotificationProvider {
  isConfigured(): boolean;
}
