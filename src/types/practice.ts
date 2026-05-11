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

// ---------------------------------------------------------------------------
// Coding challenge contract (shared with persistence agent).
// ---------------------------------------------------------------------------

export interface ChallengeTest {
  /** e.g. "test_identity_matrix" — must be a valid identifier-ish display name. */
  name: string;
  /** Python source. May reference user-defined names. Raises AssertionError on failure. */
  code: string;
}

export interface CodingChallenge {
  slug: string;
  title: string;
  summary: string;
  topicSlugs: string[];
  difficulty: Difficulty;
  estimatedMinutes: number;
  problemMarkdown: string;
  starterCode: string;
  exampleSolution: string;
  tests: ChallengeTest[];
  /** Optional extra packages to install via micropip on top of the defaults. */
  pythonPackages?: string[];
}

export interface ChallengeTestResult {
  testName: string;
  passed: boolean;
  errorMessage?: string;
}

export interface ChallengeRunOutcome {
  results: ChallengeTestResult[];
  stdout: string;
  /** Set when user code itself threw — surface in the console panel. */
  traceback?: string;
}
