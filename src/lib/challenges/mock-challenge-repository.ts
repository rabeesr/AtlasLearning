import type { ChallengeRepository } from "@/types/integrations";

const challengeBank = {
  "linear-algebra-robotics": [{ slug: "frame-change-drill", title: "Frame Change Drill" }],
  "calculus-robotics": [{ slug: "velocity-acceleration-lab", title: "Velocity and Acceleration Lab" }],
  "pid-controllers": [{ slug: "pid-tuning-baseline", title: "PID Tuning Baseline" }],
  "forward-kinematics": [{ slug: "serial-chain-transform", title: "Serial Chain Transform" }],
} as const;

export function listMockChallengeTopicSlugs() {
  return Object.keys(challengeBank);
}

export const mockChallengeRepository: ChallengeRepository = {
  async listByTopic(topicSlug) {
    return [...(challengeBank[topicSlug as keyof typeof challengeBank] ?? [])];
  },
};
