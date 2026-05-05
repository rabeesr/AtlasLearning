import { notFound } from "next/navigation";

import { QuizPlayer } from "@/components/practice/quiz-player";
import { getCurriculumData } from "@/lib/content/curriculum";
import { getQuizForTopic } from "@/lib/content/quiz-content";

export default async function TopicQuizPlayPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const [quiz, curriculum] = await Promise.all([
    getQuizForTopic(topicSlug),
    getCurriculumData(),
  ]);
  const topic = curriculum.topics.find((t) => t.slug === topicSlug);
  if (!quiz || !topic) notFound();

  return <QuizPlayer quiz={quiz} topicTitle={topic.name} />;
}
