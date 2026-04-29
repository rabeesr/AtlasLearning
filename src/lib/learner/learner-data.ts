import { getCurrentUser } from "@/lib/auth/current-user";
import { listMockChallengeTopicSlugs } from "@/lib/challenges/mock-challenge-repository";
import { getCurriculumData } from "@/lib/content/curriculum";
import { listTopicContentSlugs } from "@/lib/content/topic-content";
import { buildLearnerDashboardData } from "@/lib/learner/learner-state";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";
import { listMockQuizTopicSlugs } from "@/lib/quizzes/mock-quiz-repository";

export async function getLearnerDashboardView() {
  const [user, curriculum, contentTopicSlugs] = await Promise.all([
    getCurrentUser(),
    getCurriculumData(),
    listTopicContentSlugs(),
  ]);
  const progress = await mockProgressRepository.listTopicProgress(user.id);

  return {
    user,
    curriculum,
    dashboard: buildLearnerDashboardData({
      curriculum,
      progress,
      contentTopicSlugs,
      quizTopicSlugs: listMockQuizTopicSlugs(),
      challengeTopicSlugs: listMockChallengeTopicSlugs(),
    }),
  };
}
