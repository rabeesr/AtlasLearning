import Link from "next/link";
import type { Route } from "next";

import type { CurriculumTopic } from "@/types/domain";
import type { DashboardTopicSummary, LearnerTopicStatus } from "@/types/learner";

function statusClasses(status: LearnerTopicStatus) {
  if (status === "strong") {
    return "border-[color:color-mix(in_srgb,var(--atlas-success)_45%,transparent)] text-[var(--atlas-success)]";
  }
  if (status === "active") {
    return "border-[color:color-mix(in_srgb,var(--atlas-accent)_45%,transparent)] text-[var(--atlas-accent)]";
  }
  if (status === "needs_work") {
    return "border-[color:color-mix(in_srgb,var(--atlas-danger)_45%,transparent)] text-[var(--atlas-danger)]";
  }
  if (status === "decaying") {
    return "border-[color:color-mix(in_srgb,var(--atlas-warning)_45%,transparent)] text-[var(--atlas-warning)]";
  }
  return "border-[var(--atlas-border)] text-[var(--atlas-text-muted)]";
}

function summaryForTopic(topic: CurriculumTopic, summaries: DashboardTopicSummary[]) {
  return summaries.find((summary) => summary.topic.slug === topic.slug) ?? null;
}

export function KnowledgeGraphPreview({
  topics,
  summaries,
}: {
  topics: CurriculumTopic[];
  summaries: DashboardTopicSummary[];
}) {
  const pillars = topics.filter((topic) => topic.parentSlug === null);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {pillars.map((pillar, index) => {
        const pillarTopics = summaries.filter((summary) => summary.pillarSlug === pillar.slug);
        return (
          <section
            className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-5 shadow-[var(--atlas-shadow)]"
            key={pillar.slug}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">
                  Pillar 0{index + 1}
                </p>
                <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">{pillar.name}</h2>
              </div>
              <span className="rounded-full border border-[var(--atlas-border)] px-3 py-1 font-[var(--atlas-font-mono)] text-xs">
                {pillarTopics.length} topics
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--atlas-text-muted)]">{pillar.description}</p>
            <div className="mt-5 space-y-3">
              {pillarTopics.map((summary) => {
                const current = summaryForTopic(summary.topic, summaries);
                return (
                  <Link
                    className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] px-4 py-4 transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
                    href={`/topics/${summary.topic.slug}` as Route}
                    key={summary.topic.slug}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{summary.topic.name}</p>
                      <span
                        className={`rounded-full border px-3 py-1 font-[var(--atlas-font-mono)] text-[10px] uppercase tracking-[0.18em] ${statusClasses(summary.status)}`}
                      >
                        {summary.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{summary.topic.description}</p>
                    <p className="mt-2 text-xs leading-5 text-[var(--atlas-text-muted)]">
                      {current?.blockedBy.length
                        ? `Blocked by ${current.blockedBy.map((topic) => topic.name).join(", ")}`
                        : current?.unlocks.length
                          ? `Unlocks ${current.unlocks.map((topic) => topic.name).join(", ")}`
                          : "No downstream dependencies recorded yet."}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
