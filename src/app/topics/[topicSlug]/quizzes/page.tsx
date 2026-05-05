import Link from "next/link";

import { Badge, Card } from "@/components/shared/ui";
import { TopicPracticeList } from "@/components/practice/topic-practice-list";
import { getCurriculumData } from "@/lib/content/curriculum";
import { getQuizForTopic } from "@/lib/content/quiz-content";
import { listByTopic } from "@/lib/practice/practice-repository";

export default async function TopicQuizzesPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const [items, curriculum, quiz] = await Promise.all([
    Promise.resolve(listByTopic(topicSlug, "quiz")),
    getCurriculumData(),
    getQuizForTopic(topicSlug),
  ]);
  const topicLookup = new Map(curriculum.topics.map((t) => [t.slug, t]));

  const autoGraded = quiz?.items.filter((q) => q.type === "multiple_choice").length ?? 0;
  const selfGraded = (quiz?.items.length ?? 0) - autoGraded;

  return (
    <div className="flex flex-col gap-6">
      {quiz ? (
        <Link
          href={`/topics/${topicSlug}/quizzes/play`}
          className="block focus:outline-none"
          aria-label="Start mastery quiz"
        >
          <Card className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
                  Mastery quiz
                </p>
                <h3 className="mt-1 text-base font-semibold text-[var(--text)]">
                  Run the topic quiz
                </h3>
              </div>
              <Badge tone="accent">interactive</Badge>
            </div>
            <p className="text-sm leading-6 text-[var(--text-muted)]">
              {quiz.items.length} questions covering every key concept. Multiple-choice questions
              are auto-graded; derivation questions reveal the model answer for self-grading.
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5">
              <Badge>{quiz.items.length} questions</Badge>
              <Badge>{autoGraded} auto-graded</Badge>
              <Badge>{selfGraded} self-graded</Badge>
            </div>
          </Card>
        </Link>
      ) : null}

      <TopicPracticeList
        items={items}
        topicLookup={topicLookup}
        emptyMessage="No additional practice quizzes are tagged to this topic yet."
      />
    </div>
  );
}
