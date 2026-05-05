import type {
  ProficiencyBreakdown,
  ProficiencyComponent,
  ProficiencyComponentDetail,
  ProficiencyInputs,
} from "@/types/proficiency";

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
