import type {
  ProficiencyBreakdown,
  ProficiencyComponent,
  ProficiencyComponentDetail,
  ProficiencyInputs,
} from "@/types/proficiency";
import type { LearnerTopicStatus } from "@/types/learner";

// ---------------------------------------------------------------------------
// ALPHA 1.1 — Discrete mastery levels derived from `proficiency_score`.
// ---------------------------------------------------------------------------

export type MasteryLevel =
  | "locked"
  | "attempted"
  | "familiar"
  | "proficient"
  | "mastered";

/**
 * Map a raw proficiency score (+ topic status) to a discrete mastery level.
 * Thresholds match the milestone plan: 1+ attempted, 30+ familiar, 70+
 * proficient, 90+ mastered. A `locked` status always wins.
 */
export function levelFromScore(
  score: number,
  status: LearnerTopicStatus,
): MasteryLevel {
  if (status === "locked") return "locked";
  if (score >= 90) return "mastered";
  if (score >= 70) return "proficient";
  if (score >= 30) return "familiar";
  return "attempted";
}

/**
 * ALPHA 1.3 — Calibration: ratio of correct answers among high-confidence
 * picks. Surfaces a small dashboard badge. Server-callable, takes a
 * Supabase client (server or user-scoped) so the same RLS rules apply.
 */
export interface CalibrationStats {
  correctOnHigh: number;
  totalHigh: number;
  ratio: number | null;
}

interface CalibrationRow {
  result: string;
  confidence: string | null;
}

interface MinimalSupabaseClient {
  from(table: string): {
    select(columns: string): {
      eq(column: string, value: string): {
        eq(column: string, value: string): Promise<{
          data: CalibrationRow[] | null;
          error: { message: string } | null;
        }>;
      };
    };
  };
}

export async function getCalibration(
  supabase: MinimalSupabaseClient,
  userId: string,
): Promise<CalibrationStats> {
  if (!userId || userId === "demo-user") {
    return { correctOnHigh: 0, totalHigh: 0, ratio: null };
  }
  const { data, error } = await supabase
    .from("question_attempts")
    .select("result, confidence")
    .eq("user_id", userId)
    .eq("confidence", "high");
  if (error) {
    console.error("[calibration] read failed:", error);
    return { correctOnHigh: 0, totalHigh: 0, ratio: null };
  }
  const rows = (data ?? []) as CalibrationRow[];
  const totalHigh = rows.length;
  const correctOnHigh = rows.filter((r) => r.result === "correct").length;
  return {
    correctOnHigh,
    totalHigh,
    ratio: totalHigh > 0 ? correctOnHigh / totalHigh : null,
  };
}

export const MASTERY_LABEL: Record<MasteryLevel, string> = {
  locked: "Locked",
  attempted: "Attempted",
  familiar: "Familiar",
  proficient: "Proficient",
  mastered: "Mastered",
};

const DEFAULT_WEIGHTS: Record<ProficiencyComponent, number> = {
  learn: 0.20,
  quiz: 0.45,
  challenges: 0.20,
  projects: 0.15,
};

const LABELS: Record<ProficiencyComponent, string> = {
  learn: "Learn",
  quiz: "Quiz",
  challenges: "Challenges",
  projects: "Projects",
};

function detail(
  available: boolean,
  numerator: number,
  denominator: number,
  weight: number,
  label: string,
): ProficiencyComponentDetail {
  const ratio = available && denominator > 0 ? numerator / denominator : 0;
  return { available, ratio, weight, numerator, denominator, label };
}

export function computeProficiency(inputs: ProficiencyInputs): ProficiencyBreakdown {
  const learnTotal = inputs.totalObjectives + inputs.totalConcepts;
  const learnDone = inputs.checkedObjectives + inputs.checkedConcepts;
  const learnAvailable = learnTotal > 0;

  const quizAvailable = inputs.quiz !== null && inputs.quiz.total > 0;
  const quizScore = quizAvailable
    ? (inputs.quiz!.correct + 0.5 * inputs.quiz!.partial)
    : 0;

  const challengesAvailable = inputs.totalChallenges > 0;
  const projectsAvailable = inputs.totalProjects > 0;

  // Adaptive renormalization: drop weight from unavailable components.
  const baseWeights = { ...DEFAULT_WEIGHTS };
  if (!learnAvailable) baseWeights.learn = 0;
  if (!quizAvailable) baseWeights.quiz = 0;
  if (!challengesAvailable) baseWeights.challenges = 0;
  if (!projectsAvailable) baseWeights.projects = 0;

  const weightSum =
    baseWeights.learn + baseWeights.quiz + baseWeights.challenges + baseWeights.projects;

  const weights: Record<ProficiencyComponent, number> = weightSum > 0
    ? {
        learn: baseWeights.learn / weightSum,
        quiz: baseWeights.quiz / weightSum,
        challenges: baseWeights.challenges / weightSum,
        projects: baseWeights.projects / weightSum,
      }
    : { learn: 0, quiz: 0, challenges: 0, projects: 0 };

  const components: Record<ProficiencyComponent, ProficiencyComponentDetail> = {
    learn: detail(learnAvailable, learnDone, learnTotal, weights.learn, LABELS.learn),
    quiz: detail(
      quizAvailable,
      quizScore,
      quizAvailable ? inputs.quiz!.total : 0,
      weights.quiz,
      LABELS.quiz,
    ),
    challenges: detail(
      challengesAvailable,
      inputs.completedChallenges,
      inputs.totalChallenges,
      weights.challenges,
      LABELS.challenges,
    ),
    projects: detail(
      projectsAvailable,
      inputs.completedProjects,
      inputs.totalProjects,
      weights.projects,
      LABELS.projects,
    ),
  };

  const rawScore =
    100 *
    (components.learn.ratio * components.learn.weight +
      components.quiz.ratio * components.quiz.weight +
      components.challenges.ratio * components.challenges.weight +
      components.projects.ratio * components.projects.weight);

  return {
    score: Math.round(rawScore),
    components,
  };
}
