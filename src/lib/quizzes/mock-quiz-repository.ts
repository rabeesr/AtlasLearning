import type { QuizRepository } from "@/types/integrations";

export const mockQuizRepository: QuizRepository = {
  async listByTopic() {
    return [];
  },
};
