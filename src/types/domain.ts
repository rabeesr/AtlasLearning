export type DomainSlug = "robotics";

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface DomainConfig {
  slug: DomainSlug;
  name: string;
  description: string;
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
  dependencySlugs: string[];
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
  topics: CurriculumTopic[];
}
