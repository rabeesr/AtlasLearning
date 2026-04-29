import type { QuizRepository } from "@/types/integrations";

const quizBank = {
  "mathematics-foundations": [{ id: "quiz-math-foundations-1", prompt: "How do basis vectors define a space?" }],
  "linear-algebra-robotics": [{ id: "quiz-linear-algebra-1", prompt: "What does a homogeneous transform preserve?" }],
  "calculus-robotics": [{ id: "quiz-calculus-1", prompt: "Why does a derivative matter for velocity?" }],
  "feedback-loops": [{ id: "quiz-feedback-1", prompt: "What distinguishes open-loop from closed-loop control?" }],
  "forward-kinematics": [{ id: "quiz-forward-kinematics-1", prompt: "How do joint transforms compose?" }],
} as const;

export function listMockQuizTopicSlugs() {
  return Object.keys(quizBank);
}

export const mockQuizRepository: QuizRepository = {
  async listByTopic(topicSlug) {
    return [...(quizBank[topicSlug as keyof typeof quizBank] ?? [])];
  },
};
