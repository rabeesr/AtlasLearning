import { notFound } from "next/navigation";

import { Card } from "@/components/shared/ui";
import { Checklist } from "@/components/topic/checklist";
import { LiveProficiencyBreakdown } from "@/components/topic/live-proficiency";
import { TopicMarkdown } from "@/components/topic/topic-markdown";
import { getTopicBySlug } from "@/lib/content/curriculum";
import { getQuizForTopic } from "@/lib/content/quiz-content";
import { getTopicContent } from "@/lib/content/topic-content";
import { listByTopic } from "@/lib/practice/practice-repository";
import { isTrackedTopic } from "@/lib/progress/tracked-topics";

export default async function TopicLearnPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const topic = await getTopicBySlug(topicSlug);
  if (!topic) notFound();

  const [content, quiz] = await Promise.all([
    getTopicContent(topicSlug),
    getQuizForTopic(topicSlug),
  ]);
  const tracked = isTrackedTopic(topicSlug);

  const totalChallenges = listByTopic(topicSlug, "challenge").length;
  const totalProjects = listByTopic(topicSlug, "project").length;

  return (
    <Card>
      {content?.prerequisitesRecap.length ? (
        <div className="mb-4 rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
            Prerequisites recap
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-[var(--text)]">
            {content.prerequisitesRecap.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {tracked && content ? (
        <div className="mb-6">
          <LiveProficiencyBreakdown
            topicSlug={topicSlug}
            totalObjectives={content.learningObjectives.length}
            totalConcepts={content.keyConcepts.length}
            totalChallenges={totalChallenges}
            totalProjects={totalProjects}
            quizTotal={quiz?.items.length ?? 0}
          />
        </div>
      ) : null}

      {content?.learningObjectives.length ? (
        tracked ? (
          <div className="mb-4">
            <Checklist
              topicSlug={topicSlug}
              kind="objective"
              items={content.learningObjectives}
              title="Learning objectives"
              eyebrow="Learning objectives · check as you master each"
            />
          </div>
        ) : (
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
        )
      ) : null}

      {content ? (
        <TopicMarkdown content={content.body} />
      ) : (
        <div className="py-8 text-center text-sm text-[var(--text-muted)]">
          <p className="text-[var(--text)]">Study notes are not authored yet.</p>
          <p className="mt-2">Use quizzes, challenges, or projects to start engaging with this topic.</p>
        </div>
      )}

      {tracked && content && content.keyConcepts.length > 0 ? (
        <div className="mt-8">
          <Checklist
            topicSlug={topicSlug}
            kind="concept"
            items={content.keyConcepts}
            title="Key concepts checklist"
            eyebrow="Key concepts · check what you can explain"
          />
        </div>
      ) : null}

      {content?.sources.length ? (
        <div className="mt-8 border-t border-[var(--border)] pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--text-muted)]">
            Sources
          </p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-[var(--text-muted)]">
            {content.sources.map((src) => (
              <li key={src}>{src}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </Card>
  );
}
