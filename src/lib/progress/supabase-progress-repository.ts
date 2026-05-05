import { auth } from "@clerk/nextjs/server";

import { getCurriculumData } from "@/lib/content/curriculum";
import { getQuizForTopic } from "@/lib/content/quiz-content";
import { getTopicContent } from "@/lib/content/topic-content";
import { listByTopic } from "@/lib/practice/practice-repository";
import { computeProficiency } from "@/lib/progress/proficiency-calculator";
import { TRACKED_TOPIC_SLUGS } from "@/lib/progress/tracked-topics";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import type { ProgressRepository } from "@/types/integrations";
import type { TopicProgress, TopicStatus } from "@/types/user";

interface EngagementRow {
  topic_slug: string;
  checked_objectives: string[] | null;
  checked_concepts: string[] | null;
  completed_challenges: string[] | null;
  completed_projects: string[] | null;
  updated_at: string;
}

interface QuizAttemptRow {
  id: string;
  topic_slug: string;
  started_at: string;
  completed_at: string | null;
}

interface QuestionAttemptRow {
  attempt_id: string;
  result: "correct" | "partial" | "incorrect" | "skipped";
}

interface SeedProgressRow {
  topic_slug: string;
  status: TopicStatus;
  proficiency_score: number;
  updated_at: string;
}

function deriveStatus(score: number, hasEngagement: boolean): TopicStatus {
  if (score >= 85) return "completed";
  if (score > 0 || hasEngagement) return "in_progress";
  return "available";
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
 * Computes per-topic proficiency for the signed-in user from raw engagement
 * + quiz data. Tracked topics get a real score via `computeProficiency`;
 * other topics default to 0 / "available" until a signal exists.
 */
async function listLiveProgress(userId: string): Promise<TopicProgress[]> {
  const supabase = await getServerSupabaseClient();
  const curriculum = await getCurriculumData();

  const [engagementResult, attemptsResult] = await Promise.all([
    supabase
      .from("topic_engagement")
      .select(
        "topic_slug, checked_objectives, checked_concepts, completed_challenges, completed_projects, updated_at",
      ),
    supabase
      .from("quiz_attempts")
      .select("id, topic_slug, started_at, completed_at"),
  ]);

  if (engagementResult.error) {
    console.error("[supabase-progress-repository] engagement select failed:", engagementResult.error);
  }
  if (attemptsResult.error) {
    console.error("[supabase-progress-repository] attempts select failed:", attemptsResult.error);
  }

  const engagementByTopic = new Map<string, EngagementRow>();
  for (const row of (engagementResult.data ?? []) as EngagementRow[]) {
    engagementByTopic.set(row.topic_slug, row);
  }

  // Pick the most recent attempt per topic (prefer completed over in-flight).
  const latestAttemptByTopic = new Map<string, QuizAttemptRow>();
  for (const a of (attemptsResult.data ?? []) as QuizAttemptRow[]) {
    const existing = latestAttemptByTopic.get(a.topic_slug);
    if (!existing) {
      latestAttemptByTopic.set(a.topic_slug, a);
      continue;
    }
    const newerCompleted = Boolean(a.completed_at) && !existing.completed_at;
    const sameStateNewer =
      Boolean(a.completed_at) === Boolean(existing.completed_at) &&
      new Date(a.started_at).getTime() > new Date(existing.started_at).getTime();
    if (newerCompleted || sameStateNewer) {
      latestAttemptByTopic.set(a.topic_slug, a);
    }
  }

  // Fetch question results for those latest attempts in one round-trip.
  const attemptIds = Array.from(latestAttemptByTopic.values()).map((a) => a.id);
  const questionsByAttempt = new Map<string, QuestionAttemptRow[]>();
  if (attemptIds.length > 0) {
    const { data: qData, error: qError } = await supabase
      .from("question_attempts")
      .select("attempt_id, result")
      .in("attempt_id", attemptIds);
    if (qError) {
      console.error("[supabase-progress-repository] question select failed:", qError);
    }
    for (const q of (qData ?? []) as QuestionAttemptRow[]) {
      const arr = questionsByAttempt.get(q.attempt_id) ?? [];
      arr.push(q);
      questionsByAttempt.set(q.attempt_id, arr);
    }
  }

  const now = new Date().toISOString();
  const results: TopicProgress[] = [];

  for (const topic of curriculum.topics) {
    const slug = topic.slug;
    const isTracked = TRACKED_TOPIC_SLUGS.has(slug);

    if (!isTracked) {
      results.push({
        userId,
        topicSlug: slug,
        status: "available",
        proficiencyScore: 0,
        updatedAt: now,
      });
      continue;
    }

    const [content, quiz] = await Promise.all([
      getTopicContent(slug),
      getQuizForTopic(slug),
    ]);

    const eng = engagementByTopic.get(slug);
    const attempt = latestAttemptByTopic.get(slug);
    const questions = attempt ? questionsByAttempt.get(attempt.id) ?? [] : [];
    const correct = questions.filter((q) => q.result === "correct").length;
    const partial = questions.filter((q) => q.result === "partial").length;

    const breakdown = computeProficiency({
      totalObjectives: content?.learningObjectives.length ?? 0,
      checkedObjectives: eng?.checked_objectives?.length ?? 0,
      totalConcepts: content?.keyConcepts.length ?? 0,
      checkedConcepts: eng?.checked_concepts?.length ?? 0,
      totalChallenges: listByTopic(slug, "challenge").length,
      completedChallenges: eng?.completed_challenges?.length ?? 0,
      totalProjects: listByTopic(slug, "project").length,
      completedProjects: eng?.completed_projects?.length ?? 0,
      quiz:
        attempt && quiz
          ? { total: quiz.items.length, correct, partial }
          : null,
    });

    const hasEngagement = Boolean(eng) || Boolean(attempt);

    results.push({
      userId,
      topicSlug: slug,
      status: deriveStatus(breakdown.score, hasEngagement),
      proficiencyScore: breakdown.score,
      updatedAt: eng?.updated_at ?? attempt?.started_at ?? now,
    });
  }

  return results;
}

/**
 * Server-side progress repository.
 *
 * - Logged out: returns the seed/demo rows from `topic_progress` (user_id IS NULL).
 *   The dashboard / topic hub render exactly as before for guests.
 * - Logged in: ignores seed rows entirely and computes a per-topic
 *   `TopicProgress` from the user's own engagement + quiz attempts. Tracked
 *   topics use the live proficiency formula; other topics show baseline 0%
 *   until a real signal exists.
 */
export const supabaseProgressRepository: ProgressRepository = {
  async listTopicProgress(userId: string): Promise<TopicProgress[]> {
    const { userId: authedUserId } = await auth();
    if (!authedUserId) return listSeedProgress();
    return listLiveProgress(authedUserId);
  },
};
