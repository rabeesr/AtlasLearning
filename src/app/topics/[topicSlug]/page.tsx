import Link from "next/link";
import { notFound } from "next/navigation";

import { Card } from "@/components/shared/ui";
import { getCurriculumData } from "@/lib/content/curriculum";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";
import { listByTopic } from "@/lib/practice/practice-repository";

export default async function TopicOverviewPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const [{ dashboard }, curriculum] = await Promise.all([
    getLearnerDashboardView(),
    getCurriculumData(),
  ]);
  const summary = dashboard.summaries.find((s) => s.topic.slug === topicSlug);
  if (!summary) notFound();

  const subSummaries = summary.subtopicSlugs
    .map((slug) => dashboard.summaries.find((s) => s.topic.slug === slug))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));

  const quizzes = listByTopic(topicSlug, "quiz");
  const challenges = listByTopic(topicSlug, "challenge");
  const projects = listByTopic(topicSlug, "project");

  const prereqs = summary.topic.dependencySlugs
    .map((slug) => curriculum.topics.find((t) => t.slug === slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  return (
    <div className="grid gap-5 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        <Card>
          <h2 className="text-lg font-semibold text-[var(--text)]">Subtopics</h2>
          {subSummaries.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              No subtopics — this topic is studied as a single unit.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {subSummaries.map((sub) => (
                <li key={sub.topic.slug}>
                  <Link
                    href={`/topics/${sub.topic.slug}`}
                    className="flex items-center justify-between gap-3 rounded-md border border-[var(--border)] bg-[var(--panel-muted)] px-3 py-2 text-sm transition hover:border-[var(--border-strong)]"
                  >
                    <span className="text-[var(--text)]">{sub.topic.name}</span>
                    <span className="text-xs tabular-nums text-[var(--text-muted)]">
                      {sub.proficiencyScore}%
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-[var(--text)]">Practice at a glance</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Link
              href={`/topics/${topicSlug}/quizzes`}
              className="rounded-md border border-[var(--border)] p-3 transition hover:border-[var(--border-strong)]"
            >
              <p className="text-2xl font-semibold text-[var(--text)]">{quizzes.length}</p>
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Quizzes</p>
            </Link>
            <Link
              href={`/topics/${topicSlug}/challenges`}
              className="rounded-md border border-[var(--border)] p-3 transition hover:border-[var(--border-strong)]"
            >
              <p className="text-2xl font-semibold text-[var(--text)]">{challenges.length}</p>
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Challenges</p>
            </Link>
            <Link
              href={`/topics/${topicSlug}/projects`}
              className="rounded-md border border-[var(--border)] p-3 transition hover:border-[var(--border-strong)]"
            >
              <p className="text-2xl font-semibold text-[var(--text)]">{projects.length}</p>
              <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Projects</p>
            </Link>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Prerequisites
          </h2>
          {prereqs.length === 0 ? (
            <p className="mt-2 text-sm text-[var(--text-muted)]">None.</p>
          ) : (
            <ul className="mt-2 space-y-1.5 text-sm">
              {prereqs.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/topics/${p.slug}`}
                    className="text-[var(--accent)] hover:underline"
                  >
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {summary.unlocks.length > 0 ? (
          <Card>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Unlocks
            </h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {summary.unlocks.map((t) => (
                <li key={t.slug}>
                  <Link
                    href={`/topics/${t.slug}`}
                    className="text-[var(--text)] hover:text-[var(--accent)]"
                  >
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
