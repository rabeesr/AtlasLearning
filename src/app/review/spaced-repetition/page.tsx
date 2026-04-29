import { AtlasShell } from "@/components/shared/app-shell";
import { PracticeCenterSurface } from "@/components/shared/flagship-surfaces";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";
import { buildPracticeFilter, filterPracticeSummaries } from "@/lib/learner/learner-state";

export default async function SpacedRepetitionPage({
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
      description="Review center keeps decaying knowledge visible and lets the learner filter recovery work by topic, pillar, and readiness."
      eyebrow="Review Center"
      title="Spaced repetition and decay repair"
    >
      <PracticeCenterSurface
        basePath="/review/spaced-repetition"
        curriculum={curriculum}
        description="Review is a cross-topic center for decaying and unstable material, not a hidden utility page."
        eyebrow="Review Center"
        filter={filter}
        mode="review"
        summaries={summaries}
        title="Review queue"
      />
    </AtlasShell>
  );
}
