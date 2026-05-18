export type TutorSurface =
  | { kind: "learn"; topicSlug: string; section?: string }
  | {
      kind: "quiz";
      topicSlug: string;
      questionId: string;
      questionText: string;
      choices?: string[];
    }
  | { kind: "flashcard"; topicSlug: string; cardFront: string }
  | {
      kind: "challenge";
      challengeSlug: string;
      topicSlug?: string;
      userCode: string;
      lastTraceback?: string;
    }
  | { kind: "review"; mode: "mixed" | "flashcards"; topicSlug?: string }
  | { kind: "global" };

export type TutorKind = "question" | "explain" | "diff_hint";

export interface TutorDiffLine {
  line: number;
  before: string;
  after: string;
}

export interface TutorReply {
  kind: TutorKind;
  text: string;
  diff?: TutorDiffLine[];
}

export interface TutorMessage {
  role: "user" | "assistant";
  content: string; // raw text for user; JSON envelope text for assistant
}

export interface TutorRequest {
  sessionId: string;
  surface: TutorSurface;
  userMessage: string;
  history: TutorMessage[];
}
