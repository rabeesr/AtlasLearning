import Link from "next/link";
import type { Route } from "next";

import { TopicMarkdown } from "@/components/topic/topic-markdown";
import type { CurriculumData, CurriculumTopic, TopicContent } from "@/types/domain";
import type {
  DashboardTopicSummary,
  LearnerTopicStatus,
  LearnerDashboardData,
  PillarProgress,
  PracticeCenterFilter,
  TopicActionState,
  TopicActionKey,
} from "@/types/learner";

function statusMeta(status: LearnerTopicStatus) {
  if (status === "strong") {
    return {
      label: "Strong",
      tone: "border-[color:color-mix(in_srgb,var(--atlas-success)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--atlas-success)_12%,transparent)] text-[var(--atlas-success)]",
    };
  }
  if (status === "active") {
    return {
      label: "Active",
      tone: "border-[color:color-mix(in_srgb,var(--atlas-accent)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--atlas-accent)_12%,transparent)] text-[var(--atlas-accent)]",
    };
  }
  if (status === "needs_work") {
    return {
      label: "Needs work",
      tone: "border-[color:color-mix(in_srgb,var(--atlas-danger)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--atlas-danger)_10%,transparent)] text-[var(--atlas-danger)]",
    };
  }
  if (status === "decaying") {
    return {
      label: "Decaying",
      tone: "border-[color:color-mix(in_srgb,var(--atlas-warning)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--atlas-warning)_12%,transparent)] text-[var(--atlas-warning)]",
    };
  }
  return {
    label: "Blocked",
    tone: "border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] text-[var(--atlas-text-muted)]",
  };
}

function actionMeta(status: TopicActionState["status"]) {
  if (status === "completed") {
    return "border-[color:color-mix(in_srgb,var(--atlas-success)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--atlas-success)_12%,transparent)]";
  }
  if (status === "started" || status === "available") {
    return "border-[color:color-mix(in_srgb,var(--atlas-accent)_45%,transparent)] bg-[color:color-mix(in_srgb,var(--atlas-accent)_12%,transparent)]";
  }
  if (status === "blocked") {
    return "border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] opacity-75";
  }
  return "border-dashed border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] opacity-70";
}

function sectionLabel(label: string) {
  return (
    <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--atlas-accent)]">
      {label}
    </p>
  );
}

function StatusBadge({ status }: { status: LearnerTopicStatus }) {
  const meta = statusMeta(status);
  return (
    <span className={`rounded-full border px-3 py-1 font-[var(--atlas-font-mono)] text-xs uppercase tracking-[0.18em] ${meta.tone}`}>
      {meta.label}
    </span>
  );
}

function TopicActionBar({ actions }: { actions: TopicActionState[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => (
        <Link
          className={`rounded-[var(--atlas-radius)] border p-4 transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)] ${actionMeta(action.status)}`}
          href={action.href as Route}
          key={action.key}
        >
          <div className="flex items-center justify-between gap-3">
            <p className="font-[var(--atlas-font-display)] text-xl">{action.label}</p>
            <span className="font-[var(--atlas-font-mono)] text-[10px] uppercase tracking-[0.18em] text-[var(--atlas-text-muted)]">
              {action.status.replace("_", " ")}
            </span>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{action.detail}</p>
        </Link>
      ))}
    </div>
  );
}

function topicRow(summary: DashboardTopicSummary) {
  return (
    <Link
      className="grid gap-3 rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] p-4 transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)] xl:grid-cols-[1.2fr_0.7fr_0.8fr]"
      href={`/topics/${summary.topic.slug}` as Route}
      key={summary.topic.slug}
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold">{summary.topic.name}</p>
          <StatusBadge status={summary.status} />
        </div>
        <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{summary.topic.description}</p>
        <p className="mt-3 text-xs leading-5 text-[var(--atlas-text-muted)]">
          {summary.blockedBy.length > 0
            ? `Blocked by: ${summary.blockedBy.map((dependency) => dependency.name).join(", ")}`
            : `Unlocks: ${summary.unlocks.length > 0 ? summary.unlocks.map((topic) => topic.name).join(", ") : "no downstream topics yet"}`}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {summary.availableActions.map((action) => (
          <div className={`rounded-2xl border px-3 py-3 ${actionMeta(action.status)}`} key={action.key}>
            <p className="font-medium">{action.label}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
              {action.status.replace("_", " ")}
            </p>
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-text-muted)]">Topic progress</p>
          <p className="mt-2 font-[var(--atlas-font-display)] text-3xl">{summary.progressPercent}%</p>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-[var(--atlas-panel-alt)]">
          <div
            className="h-full rounded-full bg-[var(--atlas-accent)]"
            style={{ width: `${Math.max(summary.progressPercent, 6)}%` }}
          />
        </div>
      </div>
    </Link>
  );
}

function PillarCard({ pillar, topics }: { pillar: PillarProgress; topics: DashboardTopicSummary[] }) {
  return (
    <article className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-[var(--atlas-font-display)] text-2xl">{pillar.pillarName}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
            {pillar.topicCount} topics, {pillar.strongCount} strong, {pillar.weakCount} weak or decaying,
            {` ${pillar.blockedCount}`} blocked.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-text-muted)]">Completion</p>
          <p className="mt-2 font-[var(--atlas-font-display)] text-3xl">{pillar.progressPercent}%</p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--atlas-panel-muted)]">
        <div className="h-full rounded-full bg-[var(--atlas-accent)]" style={{ width: `${Math.max(pillar.progressPercent, 6)}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {topics.map((summary) => (
          <Link
            className="rounded-full border border-[var(--atlas-border)] px-3 py-2 text-sm transition hover:border-[var(--atlas-border-strong)]"
            href={`/topics/${summary.topic.slug}` as Route}
            key={summary.topic.slug}
          >
            {summary.topic.name}
          </Link>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          className="rounded-full bg-[var(--atlas-accent)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          href={`/?pillar=${pillar.pillarSlug}` as Route}
        >
          Focus pillar
        </Link>
        <Link
          className="rounded-full border border-[var(--atlas-border)] px-4 py-2 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
          href={`/graph?pillar=${pillar.pillarSlug}` as Route}
        >
          Dependency view
        </Link>
      </div>
    </article>
  );
}

export function FlagshipDashboard({
  curriculum,
  dashboard,
}: {
  curriculum: CurriculumData;
  dashboard: LearnerDashboardData;
}) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border-strong)] bg-[var(--atlas-panel)] p-6 shadow-[var(--atlas-glow)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {sectionLabel("Robotics Progress")}
              <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">Whole-domain learning posture</h2>
            </div>
            <Link
              className="rounded-full border border-[var(--atlas-border)] px-4 py-2 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
              href="/graph"
            >
              Full graph
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {[
              ["Strong", dashboard.statusCounts.strong, "Topics you can lean on."],
              ["Active", dashboard.statusCounts.active, "Ready and moving."],
              ["Needs work", dashboard.statusCounts.needs_work, "Unlocked but unstable."],
              ["Decaying", dashboard.statusCounts.decaying, "Review due now."],
              ["Blocked", dashboard.statusCounts.blocked, "Held behind prerequisites."],
            ].map(([label, value, detail]) => (
              <article className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4" key={label}>
                <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-text-muted)]">{label}</p>
                <p className="mt-2 font-[var(--atlas-font-display)] text-3xl">{value}</p>
                <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{detail}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-accent-strong)]">Completion</p>
              <p className="mt-2 font-[var(--atlas-font-display)] text-4xl">{dashboard.completionPercent}%</p>
              <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
                Averaged across all {curriculum.topics.length} seeded robotics topics.
              </p>
            </div>
            <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-accent-strong)]">Current focus</p>
              <p className="mt-2 font-[var(--atlas-font-display)] text-2xl">
                {dashboard.focusTopic?.topic.name ?? "No active topic yet"}
              </p>
              <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
                {dashboard.focusTopic
                  ? dashboard.focusTopic.availableActions.find((action) => action.status === "started" || action.status === "available")?.detail ??
                    "Open the topic hub for the next step."
                  : "Open a topic to start the first pass."}
              </p>
              {dashboard.focusTopic ? (
                <Link
                  className="mt-4 inline-flex rounded-full bg-[var(--atlas-accent)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                  href={`/topics/${dashboard.focusTopic.topic.slug}` as Route}
                >
                  Best next step
                </Link>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-6">
          {sectionLabel("Do Now")}
          <h2 className="mt-3 font-[var(--atlas-font-display)] text-2xl">Next actions</h2>
          <div className="mt-5 space-y-3">
            {dashboard.nextActions.map((item) => (
              <Link
                className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] px-4 py-4 transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
                href={item.href as Route}
                key={item.id}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{item.title}</p>
                  <span className="font-[var(--atlas-font-mono)] text-xs uppercase tracking-[0.18em] text-[var(--atlas-text-muted)]">
                    {item.kind}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{item.detail}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            {sectionLabel("Pillars")}
            <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">Curriculum by major pillar</h2>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-[var(--atlas-text-muted)]">
            Each pillar shows completion, instability, and where the learner still lacks entry conditions.
          </p>
        </div>
        <div className="mt-5 grid gap-4 xl:grid-cols-3">
          {dashboard.pillars.map((pillar) => (
            <PillarCard
              key={pillar.pillarSlug}
              pillar={pillar}
              topics={dashboard.summaries.filter((summary) => summary.pillarSlug === pillar.pillarSlug)}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              {sectionLabel("Topic Matrix")}
              <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">All robotics topics, grouped by pillar</h2>
            </div>
            <p className="text-sm leading-6 text-[var(--atlas-text-muted)]">
              Every topic exposes Learn, Quiz, Challenge, and Review with explicit state.
            </p>
          </div>
          <div className="mt-5 space-y-5">
            {dashboard.pillars.map((pillar) => (
              <section key={pillar.pillarSlug}>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="font-[var(--atlas-font-display)] text-2xl">{pillar.pillarName}</h3>
                  <span className="font-[var(--atlas-font-mono)] text-xs text-[var(--atlas-text-muted)]">
                    {dashboard.summaries.filter((summary) => summary.pillarSlug === pillar.pillarSlug).length} topics
                  </span>
                </div>
                <div className="space-y-3">
                  {dashboard.summaries
                    .filter((summary) => summary.pillarSlug === pillar.pillarSlug)
                    .map((summary) => topicRow(summary))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-6">
          {sectionLabel("Dependency View")}
          <h2 className="mt-3 font-[var(--atlas-font-display)] text-2xl">Graph preview</h2>
          <p className="mt-3 text-sm leading-6 text-[var(--atlas-text-muted)]">
            Use the graph as an explanation layer for why topics are open, weak, or still blocked.
          </p>
          <div className="mt-5 space-y-3">
            {dashboard.summaries
              .filter((summary) => summary.status === "blocked" || summary.status === "decaying")
              .slice(0, 6)
              .map((summary) => (
                <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] p-4" key={summary.topic.slug}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="font-semibold">{summary.topic.name}</p>
                    <StatusBadge status={summary.status} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
                    {summary.blockedBy.length > 0
                      ? `Waiting on ${summary.blockedBy.map((topic) => topic.name).join(", ")}`
                      : `Review pressure is building in ${summary.topic.name}.`}
                  </p>
                </div>
              ))}
          </div>
          <Link
            className="mt-5 inline-flex rounded-full border border-[var(--atlas-border)] px-4 py-2 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
            href="/graph"
          >
            Open full dependency graph
          </Link>
        </div>
      </section>
    </div>
  );
}

function TopicRelationshipList({
  title,
  topics,
  empty,
}: {
  title: string;
  topics: CurriculumTopic[];
  empty: string;
}) {
  return (
    <section className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-5">
      {sectionLabel(title)}
      <div className="mt-4 space-y-3">
        {topics.length > 0 ? (
          topics.map((topic) => (
            <Link
              className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] px-4 py-3 transition hover:border-[var(--atlas-border-strong)]"
              href={`/topics/${topic.slug}` as Route}
              key={topic.slug}
            >
              <p className="font-semibold">{topic.name}</p>
              <p className="mt-1 text-sm leading-6 text-[var(--atlas-text-muted)]">{topic.description}</p>
            </Link>
          ))
        ) : (
          <div className="rounded-[var(--atlas-radius)] border border-dashed border-[var(--atlas-border)] px-4 py-3 text-sm text-[var(--atlas-text-muted)]">
            {empty}
          </div>
        )}
      </div>
    </section>
  );
}

export function TopicHubSurface({
  summary,
  topicContent,
}: {
  summary: DashboardTopicSummary;
  topicContent: TopicContent | null;
}) {
  return (
    <div className="grid gap-6">
      <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border-strong)] bg-[var(--atlas-panel)] p-6 shadow-[var(--atlas-glow)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            {sectionLabel("Topic Hub")}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 className="font-[var(--atlas-font-display)] text-4xl">{summary.topic.name}</h2>
              <StatusBadge status={summary.status} />
            </div>
            <p className="mt-4 text-base leading-7 text-[var(--atlas-text-muted)]">{summary.topic.description}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-text-muted)]">Readiness</p>
              <p className="mt-2 font-[var(--atlas-font-display)] text-2xl">
                {summary.blockedBy.length > 0 ? "Blocked" : "Ready"}
              </p>
            </div>
            <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-text-muted)]">Topic progress</p>
              <p className="mt-2 font-[var(--atlas-font-display)] text-2xl">{summary.progressPercent}%</p>
            </div>
            <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-text-muted)]">Estimated session</p>
              <p className="mt-2 font-[var(--atlas-font-display)] text-2xl">{summary.topic.estimatedMinutes ?? topicContent?.estimatedMinutes ?? 45} min</p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
            <p className="font-semibold">What this topic is</p>
            <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
              {topicContent?.summary ?? "A curriculum node is defined, but the long-form learning packet is still being authored."}
            </p>
          </div>
          <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
            <p className="font-semibold">What comes next</p>
            <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
              {summary.unlocks.length > 0
                ? `Completing this topic helps unlock ${summary.unlocks.map((topic) => topic.name).join(", ")}.`
                : "This topic currently sits at the edge of the seeded curriculum."}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-6">
        {sectionLabel("Actions")}
        <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">Learn, quiz, challenge, review</h2>
        <div className="mt-5">
          <TopicActionBar actions={summary.availableActions} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-6">
          {sectionLabel("Learning Content")}
          <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">Main study material</h2>
          {topicContent ? (
            <>
              {topicContent.learningObjectives.length > 0 ? (
                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  {topicContent.learningObjectives.map((objective) => (
                    <div
                      className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] p-4 text-sm leading-6"
                      key={objective}
                    >
                      {objective}
                    </div>
                  ))}
                </div>
              ) : null}
              <div className="mt-6 rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-5">
                <TopicMarkdown content={topicContent.body} />
              </div>
            </>
          ) : (
            <div className="mt-5 rounded-[var(--atlas-radius)] border border-dashed border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] p-6">
              <p className="font-[var(--atlas-font-display)] text-2xl">Learning packet not authored yet</p>
              <p className="mt-3 text-sm leading-7 text-[var(--atlas-text-muted)]">
                The topic exists in the curriculum and in the practice flow. The reading surface will fill in once notes land in the domain content directory.
              </p>
            </div>
          )}
        </div>

        <aside className="grid gap-4">
          <section className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-5">
            {sectionLabel("Practice Linkage")}
            <div className="mt-4 space-y-3">
              {summary.availableActions
                .filter((action) => action.key !== "learn")
                .map((action) => (
                  <Link
                    className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] px-4 py-4 transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
                    href={action.href as Route}
                    key={action.key}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{action.label}</p>
                      <span className="font-[var(--atlas-font-mono)] text-xs text-[var(--atlas-text-muted)]">
                        {action.status.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{action.detail}</p>
                  </Link>
                ))}
            </div>
          </section>

          <TopicRelationshipList
            empty="No missing prerequisites are recorded for this topic."
            title="Missing Prerequisites"
            topics={summary.blockedBy}
          />
          <TopicRelationshipList
            empty="No downstream unlocks are recorded yet."
            title="Unlocks"
            topics={summary.unlocks}
          />
        </aside>
      </section>
    </div>
  );
}

function queryHref(
  basePath: string,
  current: PracticeCenterFilter,
  updates: Partial<PracticeCenterFilter>,
) {
  const merged = { ...current, ...updates };
  const params = new URLSearchParams();

  if (merged.selectedPillar) params.set("pillar", merged.selectedPillar);
  if (merged.selectedTopic) params.set("topic", merged.selectedTopic);
  if (merged.selectedStatus !== "all") params.set("status", merged.selectedStatus);
  if (merged.readiness !== "all") params.set("readiness", merged.readiness);
  if (merged.mode !== "all") params.set("mode", merged.mode);

  const query = params.toString();
  return query ? (`${basePath}?${query}` as Route) : (basePath as Route);
}

function PracticeFilterLinks({
  basePath,
  filter,
  curriculum,
  summaries,
}: {
  basePath: string;
  filter: PracticeCenterFilter;
  curriculum: CurriculumData;
  summaries: DashboardTopicSummary[];
}) {
  const pillars = curriculum.topics.filter((topic) => topic.parentSlug === null);
  return (
    <div className="grid gap-4">
      <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--atlas-text-muted)]">Pillar</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded-full border border-[var(--atlas-border)] px-3 py-2 text-sm" href={queryHref(basePath, filter, { selectedPillar: null })}>
            All
          </Link>
          {pillars.map((pillar) => (
            <Link className="rounded-full border border-[var(--atlas-border)] px-3 py-2 text-sm" href={queryHref(basePath, filter, { selectedPillar: pillar.slug })} key={pillar.slug}>
              {pillar.name}
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--atlas-text-muted)]">Status</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["all", "strong", "active", "needs_work", "decaying", "blocked"] as const).map((status) => (
            <Link className="rounded-full border border-[var(--atlas-border)] px-3 py-2 text-sm" href={queryHref(basePath, filter, { selectedStatus: status })} key={status}>
              {status.replace("_", " ")}
            </Link>
          ))}
        </div>
      </div>
      <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--atlas-text-muted)]">Topic</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link className="rounded-full border border-[var(--atlas-border)] px-3 py-2 text-sm" href={queryHref(basePath, filter, { selectedTopic: null })}>
            All
          </Link>
          {summaries.map((summary) => (
            <Link className="rounded-full border border-[var(--atlas-border)] px-3 py-2 text-sm" href={queryHref(basePath, filter, { selectedTopic: summary.topic.slug })} key={summary.topic.slug}>
              {summary.topic.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function practiceActionForMode(summary: DashboardTopicSummary, mode: TopicActionKey) {
  return summary.availableActions.find((action) => action.key === mode);
}

export function PracticeCenterSurface({
  basePath,
  title,
  eyebrow,
  description,
  mode,
  filter,
  curriculum,
  summaries,
}: {
  basePath: string;
  title: string;
  eyebrow: string;
  description: string;
  mode: TopicActionKey;
  filter: PracticeCenterFilter;
  curriculum: CurriculumData;
  summaries: DashboardTopicSummary[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
      <aside className="grid gap-4">
        <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border-strong)] bg-[var(--atlas-panel)] p-6 shadow-[var(--atlas-glow)]">
          {sectionLabel(eyebrow)}
          <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">{title}</h2>
          <p className="mt-4 text-sm leading-7 text-[var(--atlas-text-muted)]">{description}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-text-muted)]">Matches</p>
              <p className="mt-2 font-[var(--atlas-font-display)] text-3xl">{summaries.length}</p>
            </div>
            <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
              <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-text-muted)]">Blocked</p>
              <p className="mt-2 font-[var(--atlas-font-display)] text-3xl">
                {summaries.filter((summary) => summary.status === "blocked").length}
              </p>
            </div>
          </div>
        </section>
        <PracticeFilterLinks basePath={basePath} curriculum={curriculum} filter={filter} summaries={summaries} />
      </aside>

      <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-6">
        {sectionLabel("Operational Queue")}
        <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">Filtered practice set</h2>
        <div className="mt-5 space-y-3">
          {summaries.length > 0 ? (
            summaries.map((summary) => {
              const action = practiceActionForMode(summary, mode);
              return (
                <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-5" key={summary.topic.slug}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-[var(--atlas-font-display)] text-2xl">{summary.topic.name}</p>
                        <StatusBadge status={summary.status} />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{summary.topic.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.26em] text-[var(--atlas-text-muted)]">Action state</p>
                      <p className="mt-2 font-[var(--atlas-font-mono)] text-xs uppercase tracking-[0.18em]">
                        {action?.status.replace("_", " ") ?? "n/a"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                    <div className={`rounded-[var(--atlas-radius)] border p-4 ${action ? actionMeta(action.status) : "border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)]"}`}>
                      <p className="font-semibold">{action?.label ?? "Action unavailable"}</p>
                      <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
                        {summary.blockedBy.length > 0
                          ? `Blocked by ${summary.blockedBy.map((topic) => topic.name).join(", ")}.`
                          : action?.detail ?? "No action state is available yet."}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        className="rounded-full bg-[var(--atlas-accent)] px-4 py-2 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                        href={(action?.href ?? `/topics/${summary.topic.slug}`) as Route}
                      >
                        Open {mode}
                      </Link>
                      <Link
                        className="rounded-full border border-[var(--atlas-border)] px-4 py-2 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
                        href={`/topics/${summary.topic.slug}` as Route}
                      >
                        Topic hub
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-[var(--atlas-radius)] border border-dashed border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] p-6 text-sm leading-7 text-[var(--atlas-text-muted)]">
              No topics match the current filters. Clear the scope or switch pillar/status filters to reopen the queue.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
