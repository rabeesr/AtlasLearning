export interface TopicEngagement {
  topicSlug: string;
  checkedObjectives: string[];
  checkedConcepts: string[];
  completedChallenges: string[];
  completedProjects: string[];
}

export type ProficiencyComponent = "learn" | "quiz" | "challenges" | "projects";

export interface ProficiencyComponentDetail {
  available: boolean;
  ratio: number; // 0..1
  weight: number; // 0..1, after adaptive renormalization
  numerator: number;
  denominator: number;
  label: string;
}

export interface ProficiencyBreakdown {
  score: number; // 0..100, integer
  components: Record<ProficiencyComponent, ProficiencyComponentDetail>;
}

export interface ProficiencyInputs {
  totalObjectives: number;
  checkedObjectives: number;
  totalConcepts: number;
  checkedConcepts: number;
  totalChallenges: number;
  completedChallenges: number;
  totalProjects: number;
  completedProjects: number;
  quiz: {
    total: number;
    correct: number;
    partial: number;
  } | null;
}
