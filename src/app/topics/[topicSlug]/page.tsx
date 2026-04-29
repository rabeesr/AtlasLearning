import { notFound } from "next/navigation";

import { AtlasShell } from "@/components/shared/app-shell";
import { TopicHubSurface } from "@/components/shared/flagship-surfaces";
import { getTopicContent } from "@/lib/content/topic-content";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const [{ dashboard }, topicContent] = await Promise.all([
    getLearnerDashboardView(),
    getTopicContent(topicSlug),
  ]);

  const summary = dashboard.summaries.find((entry) => entry.topic.slug === topicSlug);
  if (!summary) {
    notFound();
  }

  return (
    <AtlasShell
      description="Each topic is now a consistent hub with readiness, progress, and the same four actions: Learn, Quiz, Challenge, Review."
      eyebrow="Topic Hub"
      title={summary.topic.name}
    >
      <TopicHubSurface summary={summary} topicContent={topicContent} />
    </AtlasShell>
  );
}
