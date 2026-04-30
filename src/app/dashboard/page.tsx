import Link from "next/link";

import { PhaseProgressCard } from "@/components/dashboard/phase-progress-card";
import { TopicProficiencyGrid } from "@/components/dashboard/topic-proficiency-grid";
import { Badge, Card, SectionHeader, Stat } from "@/components/shared/ui";
import { STATUS_LABEL, STATUS_TONE } from "@/lib/learner/status";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";

export default async function DashboardPage() {
  const { user, dashboard } = await getLearnerDashboardView();

  const topLevelSummaries = dashboard.summaries.filter((s) => s.topic.parentSlug === null);
  const topicsBySlug = new Map(dashboard.summaries.map((s) => [s.topic.slug, s]));

  const totalHours = Math.round(dashboard.totalMinutesEstimated / 60);

  return (
    <div className="space-y-10">
      <SectionHeader
        eyebrow={`Welcome back, ${user.displayName}`}
        title="Robotics proficiency at a glance"
        description="Track strength across phases, see where decay is starting, and drill down into topic-level detail."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Stat
          label="Overall proficiency"
          value={`${dashboard.overallProficiency}%`}
          detail={`${dashboard.topicsCompleted} of ${dashboard.topicsTotal} top-level topics strong`}
        />
        <Stat
          label="Decaying topics"
          value={dashboard.decaying.length}
          detail="Need review before retention slips further"
        />
        <Stat
          label="Needs work"
          value={dashboard.needsWork.length}
          detail="Low proficiency or not yet started"
        />
        <Stat
          label="Curriculum size"
          value={`${totalHours}h`}
          detail={`${dashboard.topicsTotal} top-level topics, ${dashboard.summaries.length - dashboard.topicsTotal} subtopics`}
        />
      </div>

      <section>
        <SectionHeader title="Phase progression" />
        <div className="grid gap-4 lg:grid-cols-3">
          {dashboard.phaseProgress.map((progress) => (
            <PhaseProgressCard key={progress.phase.slug} progress={progress} />
          ))}
        </div>
      </section>

      {dashboard.decaying.length > 0 ? (
        <section>
          <SectionHeader
            title="Decay alerts"
            description="Topics where retention is slipping. Schedule a review to lock them back in."
          />
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {dashboard.decaying.map((summary) => (
              <Card key={summary.topic.slug} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={`/topics/${summary.topic.slug}`}
                    className="text-sm font-semibold text-[var(--text)] hover:text-[var(--accent)]"
                  >
                    {summary.topic.name}
                  </Link>
                  <Badge tone="danger">Decaying</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                  Proficiency at {summary.proficiencyScore}%. Run a quick review or quiz.
                </p>
                <div className="mt-1 flex gap-2 text-xs">
                  <Link
                    href={`/topics/${summary.topic.slug}/quizzes`}
                    className="rounded-md border border-[var(--border)] px-2 py-1 text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                  >
                    Quiz now
                  </Link>
                  <Link
                    href={`/topics/${summary.topic.slug}/learn`}
                    className="rounded-md border border-[var(--border)] px-2 py-1 text-[var(--text-muted)] hover:border-[var(--border-strong)] hover:text-[var(--text)]"
                  >
                    Re-read
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <SectionHeader
          title="All topics"
          description="Top-level topics with subtopic proficiency at a glance. Click in for the full hub."
        />
        <TopicProficiencyGrid summaries={topLevelSummaries} topicsBySlug={topicsBySlug} />
      </section>

      <section>
        <SectionHeader
          title="Status legend"
          description="How a topic's status is derived from proficiency and prerequisites."
        />
        <div className="flex flex-wrap gap-2">
          {(Object.keys(STATUS_LABEL) as Array<keyof typeof STATUS_LABEL>).map((key) => (
            <Badge key={key} tone={STATUS_TONE[key]}>
              {STATUS_LABEL[key]}
            </Badge>
          ))}
        </div>
      </section>
    </div>
  );
}
