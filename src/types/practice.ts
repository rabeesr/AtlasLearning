import type { Difficulty } from "@/types/domain";

export type QuizQuestionType = "multiple_choice" | "short_answer" | "code";

export type QuestionResult = "correct" | "partial" | "incorrect" | "skipped";

interface QuizQuestionBase {
  id: string;
  prompt: string;
  difficulty: Difficulty;
  rubric?: string[];
}

export interface MultipleChoiceQuestion extends QuizQuestionBase {
  type: "multiple_choice";
  choices: string[];
  answer: string;
  explanation?: string;
}

export interface FreeFormQuestion extends QuizQuestionBase {
  type: "short_answer" | "code";
  answer: string;
}

export type QuizQuestion = MultipleChoiceQuestion | FreeFormQuestion;

export interface Quiz {
  topicSlug: string;
  items: QuizQuestion[];
}

export interface QuestionAttempt {
  questionId: string;
  result: QuestionResult;
  selectedChoice?: string;
}

export interface QuizAttemptSummary {
  attemptId: string;
  topicSlug: string;
  attempts: QuestionAttempt[];
  startedAt: number;
  completedAt?: number;
}
