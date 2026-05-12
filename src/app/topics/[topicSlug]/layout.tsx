import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { TopicTabs } from "@/components/topic/topic-tabs";
import { LiveProficiencyHeader } from "@/components/topic/live-proficiency";
import { Badge, Card, ProgressBar } from "@/components/shared/ui";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/learner/status";
import { getCurriculumData } from "@/lib/content/curriculum";
import { getQuizForTopic } from "@/lib/content/quiz-content";
import { getTopicContent } from "@/lib/content/topic-content";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";
import { listByTopic } from "@/lib/practice/practice-repository";
import { listFlashcardsForTopic } from "@/lib/content/flashcard-content";
import { isTrackedTopic } from "@/lib/progress/tracked-topics";
import type { TopicSurface } from "@/types/domain";

export default async function TopicLayout({
  params,
  children,
}: {
  params: Promise<{ topicSlug: string }>;
  children: ReactNode;
}) {
  const { topicSlug } = await params;
  const [{ dashboard }, curriculum] = await Promise.all([
    getLearnerDashboardView(),
    getCurriculumData(),
  ]);

  const summary = dashboard.summaries.find((s) => s.topic.slug === topicSlug);
  if (!summary) notFound();

  const tracked = isTrackedTopic(topicSlug);
  const [topicContent, quiz] = tracked
    ? await Promise.all([getTopicContent(topicSlug), getQuizForTopic(topicSlug)])
    : [null, null];

  const phase = summary.topic.phaseSlug
    ? curriculum.phases.find((p) => p.slug === summary.topic.phaseSlug)
    : null;

  const declared = new Set<TopicSurface>(summary.topic.surfaces);
  const hasQuiz = declared.has("quizzes") || listByTopic(topicSlug, "quiz").length > 0;
  const hasChallenge =
    declared.has("challenges") || listByTopic(topicSlug, "challenge").length > 0;
  const hasProject = declared.has("projects") || listByTopic(topicSlug, "project").length > 0;
  const hasLearn = declared.has("learn") || true;
  const hasFlashcards = listFlashcardsForTopic(topicSlug).length > 0;

  const tone =
    summary.status === "strong"
      ? "success"
      : summary.status === "decaying"
        ? "danger"
        : summary.status === "needs_work"
          ? "warning"
          : "accent";

  return (
    <div className="space-y-6">
      <Link
        href="/topics"
        className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        ← All topics
      </Link>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-[var(--text-muted)]">
              {phase ? <span>{phase.name}</span> : null}
              {summary.topic.branch ? (
                <>
                  <span>·</span>
                  <span>{summary.topic.branch}</span>
                </>
              ) : null}
            </div>
            <h1 className="mt-2 text-3xl font-semibold text-[var(--text)]">{summary.topic.name}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--text-muted)]">
              {summary.topic.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone={STATUS_TONE[summary.status]}>{STATUS_LABEL[summary.status]}</Badge>
              <Badge>{summary.topic.difficulty}</Badge>
              {summary.topic.estimatedMinutes ? (
                <Badge>{Math.round(summary.topic.estimatedMinutes / 60)}h estimated</Badge>
              ) : null}
            </div>
            {summary.blockedBy.length > 0 ? (
              <p className="mt-3 text-xs text-[var(--warning)]">
                Blocked by: {summary.blockedBy.map((b) => b.name).join(", ")}
              </p>
            ) : null}
          </div>
          <div className="md:w-64">
            {tracked && topicContent ? (
              <LiveProficiencyHeader
                topicSlug={topicSlug}
                totalObjectives={topicContent.learningObjectives.length}
                totalConcepts={topicContent.keyConcepts.length}
                totalChallenges={listByTopic(topicSlug, "challenge").length}
                totalProjects={listByTopic(topicSlug, "project").length}
                quizTotal={quiz?.items.length ?? 0}
              />
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--text-muted)]">
                  Proficiency
                </p>
                <p className="mt-1 text-3xl font-semibold tabular-nums text-[var(--text)]">
                  {summary.proficiencyScore}%
                </p>
                <ProgressBar value={summary.proficiencyScore} tone={tone} className="mt-2" />
              </>
            )}
          </div>
        </div>
      </Card>

      <TopicTabs
        topicSlug={topicSlug}
        hasLearn={hasLearn}
        hasQuiz={hasQuiz}
        hasChallenge={hasChallenge}
        hasProject={hasProject}
        hasFlashcards={hasFlashcards}
      />

      <div>{children}</div>
    </div>
  );
}
