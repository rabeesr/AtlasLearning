import { AtlasShell } from "@/components/shared/app-shell";
import { PracticeCenterSurface } from "@/components/shared/flagship-surfaces";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";
import { buildPracticeFilter, filterPracticeSummaries } from "@/lib/learner/learner-state";

export default async function QuizzesPage({
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
      description="Run quizzes across robotics topics with visibility into readiness, status, and due review pressure."
      eyebrow="Quiz Center"
      title="Cross-topic retrieval practice"
    >
      <PracticeCenterSurface
        basePath="/practice/quizzes"
        curriculum={curriculum}
        description="Use quizzes as an operational retrieval layer across the curriculum, not a hidden side action inside one page."
        eyebrow="Quiz Center"
        filter={filter}
        mode="quiz"
        summaries={summaries}
        title="Quiz queue"
      />
    </AtlasShell>
  );
}
