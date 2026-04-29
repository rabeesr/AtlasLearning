import type { ChallengeRepository } from "@/types/integrations";

export const mockChallengeRepository: ChallengeRepository = {
  async listByTopic() {
    return [];
  },
};
