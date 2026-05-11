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
  /**
   * Progressive hints, ordered easy -> strong. The UI reveals them one at a
   * time. 2-3 entries recommended: nudge, structural pointer, near-solution.
   */
  hints?: string[];
}

export interface ChallengeTestResult {
  testName: string;
  passed: boolean;
  errorMessage?: string;
  /** Wall time of just this test, in ms. */
  durationMs?: number;
  /** Anything the test itself printed to stdout. */
  stdout?: string;
}

/** Console line tagged by origin, surfaced in the runner's console panel. */
export interface ConsoleLine {
  /** "user" for user code, otherwise the test name that produced it. */
  origin: "user" | string;
  text: string;
}

/** PNG plot captured from matplotlib during a run. */
export interface ChallengePlot {
  /** Base64-encoded PNG, no data: prefix. */
  pngBase64: string;
}

export interface ChallengeRunOutcome {
  results: ChallengeTestResult[];
  /** Concatenated, untagged stdout — kept for backwards compatibility. */
  stdout: string;
  /** Tagged stdout per origin (user code or specific test). */
  consoleLines?: ConsoleLine[];
  /** Set when user code itself threw — surface in the console panel. */
  traceback?: string;
  /** Total wall time of the run in ms. */
  totalMs?: number;
  /** Inline PNG plots captured from matplotlib during user code. */
  plots?: ChallengePlot[];
}
