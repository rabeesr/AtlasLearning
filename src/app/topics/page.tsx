import Link from "next/link";

import { Badge, Card, ProgressBar, SectionHeader } from "@/components/shared/ui";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/learner/status";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";

export default async function TopicsIndexPage() {
  const { curriculum, dashboard } = await getLearnerDashboardView();
  const summariesBySlug = new Map(dashboard.summaries.map((s) => [s.topic.slug, s]));

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow="Curriculum"
        title="Topics"
        description="The full robotics tree, grouped by phase. Click a topic to enter its hub."
      />

      {curriculum.phases.map((phase) => {
        const topicsInPhase = curriculum.topics.filter(
          (t) => t.phaseSlug === phase.slug && t.parentSlug === null,
        );
        const branches = new Map<string, typeof topicsInPhase>();
        for (const topic of topicsInPhase) {
          const key = topic.branch ?? "_";
          const list = branches.get(key) ?? [];
          list.push(topic);
          branches.set(key, list);
        }

        return (
          <section key={phase.slug} className="space-y-4">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-xl font-semibold text-[var(--text)]">{phase.name}</h2>
              <span className="text-xs text-[var(--text-muted)]">{topicsInPhase.length} topics</span>
            </div>
            <p className="max-w-3xl text-sm text-[var(--text-muted)]">{phase.description}</p>

            <div className="space-y-6">
              {Array.from(branches.entries()).map(([branchName, topics]) => (
                <div key={branchName} className="space-y-3">
                  {branchName !== "_" ? (
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
                      {branchName}
                    </p>
                  ) : null}
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {topics.map((topic) => {
                      const summary = summariesBySlug.get(topic.slug);
                      const status = summary?.status ?? "active";
                      const score = summary?.proficiencyScore ?? 0;
                      const tone =
                        status === "strong"
                          ? "success"
                          : status === "decaying"
                            ? "danger"
                            : status === "needs_work"
                              ? "warning"
                              : "accent";
                      return (
                        <Card key={topic.slug} className="flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <Link
                              href={`/topics/${topic.slug}`}
                              className="text-base font-semibold text-[var(--text)] transition hover:text-[var(--accent)]"
                            >
                              {topic.name}
                            </Link>
                            <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>
                          </div>
                          <p className="text-sm leading-6 text-[var(--text-muted)]">
                            {topic.description}
                          </p>
                          <div className="flex items-center gap-3">
                            <ProgressBar value={score} tone={tone} className="flex-1" />
                            <span className="text-xs tabular-nums text-[var(--text-muted)]">
                              {score}%
                            </span>
                          </div>
                          {summary && summary.blockedBy.length > 0 ? (
                            <p className="text-xs text-[var(--warning)]">
                              Blocked by: {summary.blockedBy.map((b) => b.name).join(", ")}
                            </p>
                          ) : null}
                          <div className="flex flex-wrap gap-1.5 text-[10px] text-[var(--text-muted)]">
                            <Badge>{topic.difficulty}</Badge>
                            {topic.estimatedMinutes ? (
                              <Badge>{Math.round(topic.estimatedMinutes / 60)}h</Badge>
                            ) : null}
                            {topic.surfaces.map((s) => (
                              <Badge key={s}>{s}</Badge>
                            ))}
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
