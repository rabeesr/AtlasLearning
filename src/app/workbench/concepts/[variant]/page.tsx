import { notFound } from "next/navigation";

import { AtlasShell } from "@/components/shared/app-shell";
import { FlagshipDashboard, TopicDeepDiveSurface } from "@/components/shared/flagship-surfaces";
import {
  conceptTopicSampleFallback,
  getConceptVariant,
} from "@/lib/ui/atlas-ui";
import { getChildTopics, getCurriculumData, getTopicBySlug } from "@/lib/content/curriculum";
import { getTopicContent } from "@/lib/content/topic-content";
import { getCurrentUser } from "@/lib/auth/current-user";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";

export default async function ConceptVariantPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  const { variant: variantSlug } = await params;
  const variant = getConceptVariant(variantSlug);

  if (!variant) {
    notFound();
  }

  const user = await getCurrentUser();
  const curriculum = await getCurriculumData();
  const progress = await mockProgressRepository.listTopicProgress(user.id);
  const topic =
    (await getTopicBySlug(conceptTopicSampleFallback)) ??
    curriculum.topics.find((entry) => entry.parentSlug !== null) ??
    curriculum.topics[0];

  if (!topic) {
    notFound();
  }

  const [topicContent, childTopics] = await Promise.all([
    getTopicContent(topic.slug),
    getChildTopics(topic.slug),
  ]);

  return (
    <AtlasShell
      description={variant.description}
      eyebrow="Concept Variant"
      mode="concept"
      title={variant.name}
      variant={variant}
    >
      <div className="grid gap-6">
        <FlagshipDashboard curriculum={curriculum} progress={progress} />
        <TopicDeepDiveSurface childTopics={childTopics} topic={topic} topicContent={topicContent} />
      </div>
    </AtlasShell>
  );
}
