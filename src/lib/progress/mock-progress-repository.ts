import type { ProgressRepository } from "@/types/integrations";
import type { TopicProgress } from "@/types/user";

const now = () => new Date().toISOString();

const demoProgress: TopicProgress[] = [
  // Phase 1 — Foundations
  { userId: "demo-user", topicSlug: "linear-algebra-robotics", status: "completed", proficiencyScore: 88, updatedAt: now() },
  { userId: "demo-user", topicSlug: "matrix-vector-operations", status: "completed", proficiencyScore: 92, updatedAt: now() },
  { userId: "demo-user", topicSlug: "linear-systems", status: "completed", proficiencyScore: 86, updatedAt: now() },
  { userId: "demo-user", topicSlug: "eigenvalues-eigenvectors", status: "in_progress", proficiencyScore: 64, updatedAt: now() },
  { userId: "demo-user", topicSlug: "least-squares", status: "in_progress", proficiencyScore: 71, updatedAt: now() },

  { userId: "demo-user", topicSlug: "calculus-robotics", status: "in_progress", proficiencyScore: 58, updatedAt: now() },
  { userId: "demo-user", topicSlug: "limits-integration", status: "completed", proficiencyScore: 81, updatedAt: now() },
  { userId: "demo-user", topicSlug: "continuous-optimization", status: "in_progress", proficiencyScore: 52, updatedAt: now() },
  { userId: "demo-user", topicSlug: "ordinary-differential-equations", status: "in_progress", proficiencyScore: 41, updatedAt: now() },
  { userId: "demo-user", topicSlug: "laplace-lagrangian", status: "available", proficiencyScore: 0, updatedAt: now() },

  { userId: "demo-user", topicSlug: "intro-ai-programming", status: "in_progress", proficiencyScore: 67, updatedAt: now() },
  { userId: "demo-user", topicSlug: "cpp-fundamentals", status: "in_progress", proficiencyScore: 73, updatedAt: now() },
  { userId: "demo-user", topicSlug: "discrete-graph-math", status: "completed", proficiencyScore: 84, updatedAt: now() },
  { userId: "demo-user", topicSlug: "search-algorithms", status: "in_progress", proficiencyScore: 55, updatedAt: now() },

  { userId: "demo-user", topicSlug: "systems-programming-robotics", status: "in_progress", proficiencyScore: 49, updatedAt: now() },
  { userId: "demo-user", topicSlug: "linux-bash-git", status: "completed", proficiencyScore: 90, updatedAt: now() },
  { userId: "demo-user", topicSlug: "c-pointers-memory", status: "in_progress", proficiencyScore: 44, updatedAt: now() },
  { userId: "demo-user", topicSlug: "multithreading-concurrency", status: "available", proficiencyScore: 0, updatedAt: now() },
  { userId: "demo-user", topicSlug: "debugging-tools", status: "in_progress", proficiencyScore: 35, updatedAt: now() },

  // Phase 2 — Hardware & Motion (decaying / partial)
  { userId: "demo-user", topicSlug: "building-moving-robots", status: "decaying", proficiencyScore: 62, updatedAt: now() },
  { userId: "demo-user", topicSlug: "pid-controllers", status: "decaying", proficiencyScore: 58, updatedAt: now() },
  { userId: "demo-user", topicSlug: "rigid-body-kinematics", status: "available", proficiencyScore: 0, updatedAt: now() },
  { userId: "demo-user", topicSlug: "ros2", status: "available", proficiencyScore: 0, updatedAt: now() },

  // Phase 3 — Autonomy (locked behind prereqs)
  { userId: "demo-user", topicSlug: "advanced-math-robotics", status: "locked", proficiencyScore: 0, updatedAt: now() },
  { userId: "demo-user", topicSlug: "mobile-robotics-slam", status: "locked", proficiencyScore: 0, updatedAt: now() },
  { userId: "demo-user", topicSlug: "perception-computer-vision", status: "available", proficiencyScore: 0, updatedAt: now() },
];

export const mockProgressRepository: ProgressRepository = {
  async listTopicProgress(userId: string) {
    return demoProgress.filter((entry) => entry.userId === userId);
  },
};
