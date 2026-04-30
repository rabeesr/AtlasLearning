export type DomainSlug = "robotics";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export type TopicSurface = "learn" | "quizzes" | "challenges" | "projects";

export interface DomainConfig {
  slug: DomainSlug;
  name: string;
  description: string;
}

export interface Phase {
  slug: string;
  name: string;
  description: string;
  order: number;
}

export interface CurriculumDependency {
  from: string;
  to: string;
}

export interface CurriculumTopic {
  slug: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  parentSlug: string | null;
  phaseSlug: string | null;
  branch: string | null;
  dependencySlugs: string[];
  surfaces: TopicSurface[];
  estimatedMinutes?: number;
}

export interface TopicContent {
  slug: string;
  title: string;
  summary: string;
  learningObjectives: string[];
  estimatedMinutes?: number;
  body: string;
}

export interface CurriculumData {
  domain: DomainConfig;
  phases: Phase[];
  topics: CurriculumTopic[];
}

export type PracticeKind = "quiz" | "challenge" | "project";

export interface PracticeItem {
  slug: string;
  kind: PracticeKind;
  title: string;
  summary: string;
  topicSlugs: string[];
  difficulty: Difficulty;
  estimatedMinutes: number;
}

export interface QuizItem extends PracticeItem {
  kind: "quiz";
  questionCount: number;
}

export interface ChallengeItem extends PracticeItem {
  kind: "challenge";
  language: string;
}

export interface ProjectItem extends PracticeItem {
  kind: "project";
  deliverables: string[];
}
