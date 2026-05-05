import { getCurriculumData } from "@/lib/content/curriculum";
import { getQuizForTopic } from "@/lib/content/quiz-content";
import { listByTopic } from "@/lib/practice/practice-repository";
import { computeProficiency } from "@/lib/progress/proficiency-calculator";
import { TRACKED_TOPIC_SLUGS } from "@/lib/progress/tracked-topics";
import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { TopicProgress, TopicStatus } from "@/types/user";

export interface EngagementRow {
  topic_slug: string;
  checked_objectives: string[] | null;
  checked_concepts: string[] | null;
  completed_challenges: string[] | null;
  completed_projects: string[] | null;
  updated_at: string;
}

export interface QuizAttemptRow {
  id: string;
  topic_slug: string;
  started_at: string;
}

export interface QuestionAttemptRow {
  attempt_id: string;
  question_id: string;
  result: "correct" | "partial" | "incorrect" | "skipped";
}

function deriveStatus(score: number, hasEngagement: boolean): TopicStatus {
  if (score >= 85) return "completed";
  if (score > 0 || hasEngagement) return "in_progress";
  return "available";
}

export async function listLiveTopicProgressForUser(userId: string): Promise<TopicProgress[]> {
  const supabase = await getServerSupabaseClient();
  return listLiveTopicProgressForUserWithClient(userId, supabase);
}

export async function listLiveTopicProgressForUserWithClient(
  userId: string,
  supabase: SupabaseClient,
): Promise<TopicProgress[]> {
  const [engagementResult, attemptsResult, questionResult] = await Promise.all([
    supabase
      .from("topic_engagement")
      .select(
        "topic_slug, checked_objectives, checked_concepts, completed_challenges, completed_projects, updated_at",
      )
      .eq("user_id", userId),
    supabase
      .from("quiz_attempts")
      .select("id, topic_slug, started_at")
      .eq("user_id", userId),
    supabase
      .from("question_attempts")
      .select("attempt_id, question_id, result")
      .eq("user_id", userId),
  ]);

  if (engagementResult.error) {
    console.error("[live-topic-progress] engagement select failed:", engagementResult.error);
  }
  if (attemptsResult.error) {
    console.error("[live-topic-progress] attempts select failed:", attemptsResult.error);
  }
  if (questionResult.error) {
    console.error("[live-topic-progress] question select failed:", questionResult.error);
  }

  return buildLiveTopicProgressFromRows(
    userId,
    (engagementResult.data ?? []) as EngagementRow[],
    (attemptsResult.data ?? []) as QuizAttemptRow[],
    (questionResult.data ?? []) as QuestionAttemptRow[],
  );
}

export async function buildLiveTopicProgressFromRows(
  userId: string,
  engagementRows: EngagementRow[],
  attemptRows: QuizAttemptRow[],
  questionRows: QuestionAttemptRow[],
): Promise<TopicProgress[]> {
  const curriculum = await getCurriculumData();

  const engagementByTopic = new Map<string, EngagementRow>();
  for (const row of engagementRows) {
    engagementByTopic.set(row.topic_slug, row);
  }

  const attemptsById = new Map<string, QuizAttemptRow>();
  const attemptsByTopic = new Map<string, QuizAttemptRow[]>();
  for (const row of attemptRows) {
    attemptsById.set(row.id, row);
    const arr = attemptsByTopic.get(row.topic_slug) ?? [];
    arr.push(row);
    attemptsByTopic.set(row.topic_slug, arr);
  }

  const latestQuestionResultByTopic = new Map<
    string,
    Map<string, QuestionAttemptRow & { started_at: string }>
  >();
  for (const row of questionRows) {
    const attempt = attemptsById.get(row.attempt_id);
    if (!attempt) continue;
    const byQuestion = latestQuestionResultByTopic.get(attempt.topic_slug) ?? new Map();
    const existing = byQuestion.get(row.question_id);
    if (
      !existing ||
      new Date(existing.started_at).getTime() < new Date(attempt.started_at).getTime()
    ) {
      byQuestion.set(row.question_id, { ...row, started_at: attempt.started_at });
    }
    latestQuestionResultByTopic.set(attempt.topic_slug, byQuestion);
  }

  const now = new Date().toISOString();
  const results: TopicProgress[] = [];

  for (const topic of curriculum.topics) {
    const slug = topic.slug;
    if (!TRACKED_TOPIC_SLUGS.has(slug)) {
      results.push({
        userId,
        topicSlug: slug,
        status: "available",
        proficiencyScore: 0,
        updatedAt: now,
      });
      continue;
    }

    const [content, quiz] = await Promise.all([importTopicContent(slug), getQuizForTopic(slug)]);
    const eng = engagementByTopic.get(slug);
    const latestQuestionResults = Array.from(
      latestQuestionResultByTopic.get(slug)?.values() ?? [],
    );
    const correct = latestQuestionResults.filter((q) => q.result === "correct").length;
    const partial = latestQuestionResults.filter((q) => q.result === "partial").length;
    const latestAttemptStarted = attemptsByTopic
      .get(slug)
      ?.map((attempt) => attempt.started_at)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];

    const breakdown = computeProficiency({
      totalObjectives: content.learningObjectives.length,
      checkedObjectives: eng?.checked_objectives?.length ?? 0,
      totalConcepts: content.keyConcepts.length,
      checkedConcepts: eng?.checked_concepts?.length ?? 0,
      totalChallenges: listByTopic(slug, "challenge").length,
      completedChallenges: eng?.completed_challenges?.length ?? 0,
      totalProjects: listByTopic(slug, "project").length,
      completedProjects: eng?.completed_projects?.length ?? 0,
      quiz:
        quiz && latestQuestionResults.length > 0
          ? { total: quiz.items.length, correct, partial }
          : null,
    });

    const hasEngagement =
      Boolean(eng) || latestQuestionResults.length > 0 || Boolean(latestAttemptStarted);
    results.push({
      userId,
      topicSlug: slug,
      status: deriveStatus(breakdown.score, hasEngagement),
      proficiencyScore: breakdown.score,
      updatedAt: eng?.updated_at ?? latestAttemptStarted ?? now,
    });
  }

  return results;
}

async function importTopicContent(topicSlug: string) {
  const { getTopicContent } = await import("@/lib/content/topic-content");
  const topic = await getTopicContent(topicSlug);
  return {
    learningObjectives: topic?.learningObjectives ?? [],
    keyConcepts: topic?.keyConcepts ?? [],
  };
}
