import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import { buildLearnerDashboardData } from "@/lib/learner/learner-state";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";

export async function getLearnerDashboardView() {
  const [user, curriculum] = await Promise.all([getCurrentUser(), getCurriculumData()]);
  const progress = await mockProgressRepository.listTopicProgress(user.id);

  return {
    user,
    curriculum,
    dashboard: buildLearnerDashboardData({ curriculum, progress }),
  };
}
