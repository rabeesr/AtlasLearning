import { notFound } from "next/navigation";

import { Card } from "@/components/shared/ui";
import { TopicMarkdown } from "@/components/topic/topic-markdown";
import { getTopicBySlug } from "@/lib/content/curriculum";
import { getTopicContent } from "@/lib/content/topic-content";

export default async function TopicLearnPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const topic = await getTopicBySlug(topicSlug);
  if (!topic) notFound();

  const content = await getTopicContent(topicSlug);

  return (
    <Card>
      {content?.learningObjectives.length ? (
        <div className="mb-6 rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
            Learning objectives
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--text)]">
            {content.learningObjectives.map((obj) => (
              <li key={obj}>{obj}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {content ? (
        <TopicMarkdown content={content.body} />
      ) : (
        <div className="py-8 text-center text-sm text-[var(--text-muted)]">
          <p className="text-[var(--text)]">Study notes are not authored yet.</p>
          <p className="mt-2">Use quizzes, challenges, or projects to start engaging with this topic.</p>
        </div>
      )}
    </Card>
  );
}
