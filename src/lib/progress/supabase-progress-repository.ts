import { auth } from "@clerk/nextjs/server";

import { listLiveTopicProgressForUser } from "@/lib/progress/live-topic-progress";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import type { ProgressRepository } from "@/types/integrations";
import type { TopicProgress, TopicStatus } from "@/types/user";

interface SeedProgressRow {
  topic_slug: string;
  status: TopicStatus;
  proficiency_score: number;
  updated_at: string;
}

async function listSeedProgress(): Promise<TopicProgress[]> {
  const supabase = await getServerSupabaseClient();
  const { data, error } = await supabase
    .from("topic_progress")
    .select("topic_slug, status, proficiency_score, updated_at")
    .is("user_id", null);
  if (error) {
    console.error("[supabase-progress-repository] seed select failed:", error);
    return [];
  }
  return ((data ?? []) as SeedProgressRow[]).map((row) => ({
    userId: "demo-user",
    topicSlug: row.topic_slug,
    status: row.status,
    proficiencyScore: row.proficiency_score,
    updatedAt: row.updated_at,
  }));
}

/**
 * Server-side progress repository.
 *
 * - Logged out: returns the seed/demo rows from `topic_progress` (user_id IS NULL).
 * - Logged in: computes per-topic proficiency from the user's engagement plus
 *   the latest result for each quiz question, regardless of whether it came
 *   from a full web quiz or a single-question review email.
 */
export const supabaseProgressRepository: ProgressRepository = {
  async listTopicProgress(_userId: string): Promise<TopicProgress[]> {
    void _userId;
    const { userId: authedUserId } = await auth();
    if (!authedUserId) return listSeedProgress();
    return listLiveTopicProgressForUser(authedUserId);
  },
};
