import { notFound } from "next/navigation";

import { AtlasShell } from "@/components/shared/app-shell";
import { TopicDeepDiveSurface } from "@/components/shared/flagship-surfaces";
import { getChildTopics, getTopicBySlug } from "@/lib/content/curriculum";
import { getTopicContent } from "@/lib/content/topic-content";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const [topic, topicContent, childTopics] = await Promise.all([
    getTopicBySlug(topicSlug),
    getTopicContent(topicSlug),
    getChildTopics(topicSlug),
  ]);

  if (!topic) {
    notFound();
  }

  return (
    <AtlasShell
      description="The deep-dive page is the flagship study room: mission framing, prerequisite visibility, learning objectives, and long-form material in one place."
      eyebrow="Topic Deep Dive"
      title={topic.name}
    >
      <TopicDeepDiveSurface childTopics={childTopics} topic={topic} topicContent={topicContent} />
    </AtlasShell>
  );
}
