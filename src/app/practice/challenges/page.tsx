import { AtlasShell } from "@/components/shared/app-shell";
import { PracticeCenterSurface } from "@/components/shared/flagship-surfaces";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";
import { buildPracticeFilter, filterPracticeSummaries } from "@/lib/learner/learner-state";

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ curriculum, dashboard }, resolvedSearchParams] = await Promise.all([
    getLearnerDashboardView(),
    searchParams,
  ]);
  const filter = buildPracticeFilter(resolvedSearchParams);
  const summaries = filterPracticeSummaries(dashboard.summaries, filter);

  return (
    <AtlasShell
      description="Use challenge runs to push from explanation into applied robotics work, with readiness and dependency visibility."
      eyebrow="Challenge Center"
      title="Applied practice across the curriculum"
    >
      <PracticeCenterSurface
        basePath="/practice/challenges"
        curriculum={curriculum}
        description="The challenge center stays cross-topic so the learner can choose by pillar, readiness, or instability instead of hunting inside individual topic pages."
        eyebrow="Challenge Center"
        filter={filter}
        mode="challenge"
        summaries={summaries}
        title="Challenge queue"
      />
    </AtlasShell>
  );
}
