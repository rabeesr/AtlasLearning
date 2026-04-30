import { TopicPracticeList } from "@/components/practice/topic-practice-list";
import { getCurriculumData } from "@/lib/content/curriculum";
import { listByTopic } from "@/lib/practice/practice-repository";

export default async function TopicProjectsPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const items = listByTopic(topicSlug, "project");
  const curriculum = await getCurriculumData();
  const topicLookup = new Map(curriculum.topics.map((t) => [t.slug, t]));

  return (
    <TopicPracticeList
      items={items}
      topicLookup={topicLookup}
      emptyMessage="No projects are tagged to this topic yet."
    />
  );
}
