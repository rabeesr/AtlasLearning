import type { ProgressRepository } from "@/types/integrations";
import type { TopicProgress } from "@/types/user";

const demoProgress: TopicProgress[] = [
  {
    userId: "demo-user",
    topicSlug: "mathematics-foundations",
    status: "completed",
    proficiencyScore: 89,
    updatedAt: new Date().toISOString(),
  },
  {
    userId: "demo-user",
    topicSlug: "linear-algebra-robotics",
    status: "completed",
    proficiencyScore: 91,
    updatedAt: new Date().toISOString(),
  },
  {
    userId: "demo-user",
    topicSlug: "calculus-robotics",
    status: "in_progress",
    proficiencyScore: 38,
    updatedAt: new Date().toISOString(),
  },
  {
    userId: "demo-user",
    topicSlug: "probability-statistics",
    status: "in_progress",
    proficiencyScore: 62,
    updatedAt: new Date().toISOString(),
  },
  {
    userId: "demo-user",
    topicSlug: "control-theory",
    status: "available",
    proficiencyScore: 52,
    updatedAt: new Date().toISOString(),
  },
  {
    userId: "demo-user",
    topicSlug: "feedback-loops",
    status: "in_progress",
    proficiencyScore: 58,
    updatedAt: new Date().toISOString(),
  },
  {
    userId: "demo-user",
    topicSlug: "kinematics-dynamics",
    status: "decaying",
    proficiencyScore: 74,
    updatedAt: new Date().toISOString(),
  },
  {
    userId: "demo-user",
    topicSlug: "forward-kinematics",
    status: "in_progress",
    proficiencyScore: 49,
    updatedAt: new Date().toISOString(),
  },
  {
    userId: "demo-user",
    topicSlug: "inverse-kinematics",
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
