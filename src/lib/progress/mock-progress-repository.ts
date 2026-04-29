import type { ProgressRepository } from "@/types/integrations";
import type { TopicProgress } from "@/types/user";

const demoProgress: TopicProgress[] = [
  {
    userId: "demo-user",
    topicSlug: "mathematics-foundations",
    status: "in_progress",
    proficiencyScore: 28,
    updatedAt: new Date().toISOString(),
  },
  {
    userId: "demo-user",
    topicSlug: "linear-algebra-robotics",
    status: "available",
    proficiencyScore: 0,
    updatedAt: new Date().toISOString(),
  },
];

export const mockProgressRepository: ProgressRepository = {
  async listTopicProgress(userId: string) {
    return demoProgress.filter((entry) => entry.userId === userId);
  },
};
