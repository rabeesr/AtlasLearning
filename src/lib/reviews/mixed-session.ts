/**
 * ALPHA 1.2 — Mixed Review Session builder.
 *
 * Two modes:
 *  - "refresh": sample items only from topics whose proficiency_score is at
 *    Proficient or Mastered (>= 70). Failing an item should demote the topic.
 *  - "mixed":   sample items from any non-locked topic. No demotion.
 *
 * Output is a Latin-square-style interleaving of quiz items and challenges
 * so adjacent items rarely share a topic.
 *
 * Server-only — reads from filesystem-backed quiz + challenge repos and
 * (optionally) `topic_progress` via the existing progress repository.
 */
import "server-only";

import { auth } from "@clerk/nextjs/server";

import { getServerSupabaseClient } from "@/lib/supabase/server-client";
import { listCodingChallenges } from "@/lib/practice/challenge-repository";
import { getQuizForTopic } from "@/lib/content/quiz-content";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";
import type { CodingChallenge, QuizQuestion } from "@/types/practice";

export type MixedMode = "refresh" | "mixed";

export interface QuizSessionItem {
  kind: "quiz";
  topicSlug: string;
  topicTitle: string;
  itemSlug: string;        // questionId
  question: QuizQuestion;
}

export interface ChallengeSessionItem {
  kind: "challenge";
  topicSlug: string;
  topicTitle: string;
  itemSlug: string;        // challenge slug
  challenge: CodingChallenge;
}

export type SessionItem = QuizSessionItem | ChallengeSessionItem;

export interface BuildSessionInput {
  mode: MixedMode;
  n: number;
  /** Currently unused — kept on the contract for future per-user filtering. */
  userId?: string;
}

export interface MixedSessionPreview {
  refreshEligibleTopics: number;
  mixedEligibleTopics: number;
  totalItemsAvailable: number;
}

const REFRESH_FLOOR = 70;

interface TopicEntry {
  slug: string;
  title: string;
  score: number;
  status: string;
}

async function collectEligibleTopics(mode: MixedMode): Promise<TopicEntry[]> {
  const { dashboard, curriculum } = await getLearnerDashboardView();
  const titleBySlug = new Map(curriculum.topics.map((t) => [t.slug, t.name]));
  return dashboard.summaries
    .map((s) => ({
      slug: s.topic.slug,
      title: titleBySlug.get(s.topic.slug) ?? s.topic.slug,
      score: s.proficiencyScore,
      status: s.status,
    }))
    .filter((t) => {
      if (t.status === "locked") return false;
      if (mode === "refresh") return t.score >= REFRESH_FLOOR;
      return true;
    });
}

async function loadItemsForTopic(topic: TopicEntry, allChallenges: CodingChallenge[]) {
  const quiz = await getQuizForTopic(topic.slug);
  const quizItems: QuizSessionItem[] = (quiz?.items ?? []).map((q) => ({
    kind: "quiz",
    topicSlug: topic.slug,
    topicTitle: topic.title,
    itemSlug: q.id,
    question: q,
  }));
  const challengeItems: ChallengeSessionItem[] = allChallenges
    .filter((c) => c.topicSlugs.includes(topic.slug))
    .map((c) => ({
      kind: "challenge",
      topicSlug: topic.slug,
      topicTitle: topic.title,
      itemSlug: c.slug,
      challenge: c,
    }));
  return { quizItems, challengeItems };
}

/**
 * Round-robin (Latin-square style) interleave: pick one item from each
 * topic's pool in rotation. Within a topic, alternate kind so quizzes and
 * challenges interleave too.
 */
function interleave(pools: SessionItem[][], n: number): SessionItem[] {
  const out: SessionItem[] = [];
  const cursors = pools.map(() => 0);
  let exhausted = false;
  while (out.length < n && !exhausted) {
    exhausted = true;
    for (let i = 0; i < pools.length && out.length < n; i++) {
      const pool = pools[i];
      const idx = cursors[i];
      if (idx < pool.length) {
        out.push(pool[idx]);
        cursors[i] = idx + 1;
        exhausted = false;
      }
    }
  }
  return out;
}

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function buildSession(
  input: BuildSessionInput,
): Promise<SessionItem[]> {
  const { mode } = input;
  const n = Math.max(1, Math.min(50, input.n));
  const topics = await collectEligibleTopics(mode);
  if (topics.length === 0) return [];

  const allChallenges = listCodingChallenges();
  const perTopic = await Promise.all(
    topics.map((t) => loadItemsForTopic(t, allChallenges)),
  );

  // Interleave the kinds inside each topic too (quiz, challenge, quiz, …).
  const pools: SessionItem[][] = perTopic.map(({ quizItems, challengeItems }) => {
    shuffleInPlace(quizItems);
    shuffleInPlace(challengeItems);
    const out: SessionItem[] = [];
    const max = Math.max(quizItems.length, challengeItems.length);
    for (let i = 0; i < max; i++) {
      if (i < quizItems.length) out.push(quizItems[i]);
      if (i < challengeItems.length) out.push(challengeItems[i]);
    }
    return out;
  });

  // Rotate pool order so each call doesn't start with the same topic.
  const offset = Math.floor(Math.random() * pools.length);
  const rotated = pools.slice(offset).concat(pools.slice(0, offset));
  return interleave(rotated, n);
}

/**
 * Dashboard preview counts — how many items are available in each mode.
 * Cheap-ish: loads quiz + challenge metadata but no Pyodide.
 */
export async function previewSessionCounts(): Promise<{
  refresh: MixedSessionPreview;
  mixed: MixedSessionPreview;
}> {
  const allChallenges = listCodingChallenges();
  const compute = async (mode: MixedMode) => {
    const topics = await collectEligibleTopics(mode);
    const perTopic = await Promise.all(
      topics.map((t) => loadItemsForTopic(t, allChallenges)),
    );
    const total = perTopic.reduce(
      (sum, p) => sum + p.quizItems.length + p.challengeItems.length,
      0,
    );
    return {
      refreshEligibleTopics: mode === "refresh" ? topics.length : 0,
      mixedEligibleTopics: mode === "mixed" ? topics.length : 0,
      totalItemsAvailable: total,
    };
  };
  const [refresh, mixed] = await Promise.all([compute("refresh"), compute("mixed")]);
  return { refresh, mixed };
}

/**
 * Server-side demotion writer for refresh-mode failures. Called by the
 * mixed-session runner via a server action wrapper. Demo / signed-out
 * users are no-ops by RLS — `auth()` returns null and the helper exits.
 */
export async function applyDemotionServer(topicSlug: string, delta: number) {
  const { userId } = await auth();
  if (!userId || delta === 0) return;
  const supabase = await getServerSupabaseClient();

  const { data, error } = await supabase
    .from("topic_progress")
    .select("proficiency_score, status, user_id")
    .eq("topic_slug", topicSlug)
    .limit(2);
  if (error) {
    console.error("[mixed-session] demotion read failed:", error);
    return;
  }
  const ownRow = (data ?? []).find((r) => r.user_id === userId);
  const seedRow = (data ?? []).find((r) => r.user_id === null);
  const current =
    ownRow?.proficiency_score ?? seedRow?.proficiency_score ?? 0;
  const status = ownRow?.status ?? seedRow?.status ?? "in_progress";
  const next = Math.max(0, Math.min(100, current + delta));
  const updatedAt = new Date().toISOString();

  if (ownRow) {
    const { error: updateError } = await supabase
      .from("topic_progress")
      .update({ proficiency_score: next, updated_at: updatedAt })
      .eq("user_id", userId)
      .eq("topic_slug", topicSlug);
    if (updateError) {
      console.error("[mixed-session] demotion update failed:", updateError);
    }
  } else {
    const { error: insertError } = await supabase.from("topic_progress").insert({
      user_id: userId,
      topic_slug: topicSlug,
      status,
      proficiency_score: next,
      updated_at: updatedAt,
    });
    if (insertError) {
      console.error("[mixed-session] demotion insert failed:", insertError);
    }
  }
}
