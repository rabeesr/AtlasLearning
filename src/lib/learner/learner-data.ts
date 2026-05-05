import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import { buildLearnerDashboardData } from "@/lib/learner/learner-state";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";
import { supabaseProgressRepository } from "@/lib/progress/supabase-progress-repository";

/**
 * Loads the full learner dashboard view.
 *
 * - When Supabase env vars are configured, reads `topic_progress` via the
 *   server-side Supabase client. RLS scopes results: anon sees seed rows,
 *   signed-in users see seed + own (own takes precedence per topic).
 * - When env vars are missing (fresh checkout before `.env.local` is set up),
 *   falls back to the in-repo mock data so the app keeps rendering.
 */
function hasSupabaseEnv(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export async function getLearnerDashboardView() {
  const [user, curriculum] = await Promise.all([getCurrentUser(), getCurriculumData()]);
  const repository = hasSupabaseEnv() ? supabaseProgressRepository : mockProgressRepository;
  const progress = await repository.listTopicProgress(user.id);

  return {
    user,
    curriculum,
    dashboard: buildLearnerDashboardData({ curriculum, progress }),
  };
}
