import Link from "next/link";

import { Badge, Card, ProgressBar } from "@/components/shared/ui";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/learner/status";
import type { TopicSummary } from "@/types/learner";

export function TopicProficiencyGrid({
  summaries,
  topicsBySlug,
}: {
  summaries: TopicSummary[];
  topicsBySlug: Map<string, TopicSummary>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {summaries.map((summary) => {
        const subSummaries = summary.subtopicSlugs
          .map((slug) => topicsBySlug.get(slug))
          .filter((entry): entry is TopicSummary => Boolean(entry));
        const tone =
          summary.status === "strong"
            ? "success"
            : summary.status === "decaying"
              ? "danger"
              : summary.status === "needs_work"
                ? "warning"
                : "accent";

        return (
          <Card key={summary.topic.slug} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <Link
                  href={`/topics/${summary.topic.slug}`}
                  className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)] transition hover:text-[var(--accent-strong)]"
                >
                  {summary.topic.name}
                </Link>
                {summary.topic.branch ? (
                  <p className="mt-1 text-[12px] uppercase tracking-wider text-[var(--text-muted)]">
                    {summary.topic.branch}
                  </p>
                ) : null}
              </div>
              <Badge tone={STATUS_TONE[summary.status]}>{STATUS_LABEL[summary.status]}</Badge>
            </div>
            <div className="flex items-center gap-3">
              <ProgressBar value={summary.proficiencyScore} tone={tone} className="flex-1" />
              <span className="text-[15px] tabular-nums text-[var(--text-muted)]">
                {summary.proficiencyScore}%
              </span>
            </div>
            {subSummaries.length > 0 ? (
              <ul className="mt-1 space-y-2 border-t border-[var(--border)] pt-3 text-[14px]">
                {subSummaries.slice(0, 5).map((sub) => (
                  <li key={sub.topic.slug} className="flex items-center justify-between gap-2">
                    <Link
                      href={`/topics/${sub.topic.slug}`}
                      className="truncate text-[var(--text-muted)] transition hover:text-[var(--text)]"
                    >
                      {sub.topic.name}
                    </Link>
                    <span className="shrink-0 tabular-nums text-[var(--text-muted)]">
                      {sub.proficiencyScore}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
