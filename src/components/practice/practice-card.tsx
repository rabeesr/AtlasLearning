import Link from "next/link";

import { PracticeCompletionToggle } from "@/components/practice/practice-completion-toggle";
import { Badge, Card } from "@/components/shared/ui";
import { isTrackedTopic } from "@/lib/progress/tracked-topics";
import type { CurriculumTopic, PracticeItem } from "@/types/domain";

const KIND_LABEL = { quiz: "Quiz", challenge: "Challenge", project: "Project" } as const;
const LIVE_QUIZ_ROUTE_BY_ITEM_SLUG: Record<string, string> = {
  "linear-algebra-basics": "linear-algebra-robotics",
  "calculus-foundations": "calculus-robotics",
};

export function PracticeCard({
  item,
  topicLookup,
  completionTopicSlug,
  forceQuizComingSoon = false,
}: {
  item: PracticeItem;
  topicLookup: Map<string, CurriculumTopic>;
  completionTopicSlug?: string;
  forceQuizComingSoon?: boolean;
}) {
  const tagged = item.topicSlugs
    .map((slug) => topicLookup.get(slug))
    .filter((t): t is CurriculumTopic => Boolean(t));
  const isCrossTopic = item.topicSlugs.length > 1;

  const readyTopic = tagged.find((t) => isTrackedTopic(t.slug));
  const playableQuizTopicSlug =
    item.kind === "quiz" && !forceQuizComingSoon
      ? LIVE_QUIZ_ROUTE_BY_ITEM_SLUG[item.slug]
      : undefined;
  const playableQuizTopic = playableQuizTopicSlug
    ? topicLookup.get(playableQuizTopicSlug)
    : undefined;
  const isComingSoon = !readyTopic;
  const showComingSoon =
    item.kind === "quiz" ? forceQuizComingSoon || !playableQuizTopic : isComingSoon;

  const titleNode =
    item.kind === "challenge" ? (
      <Link
        href={`/challenges/${item.slug}`}
        className="mt-1 block text-base font-semibold text-[var(--text)] transition hover:text-[var(--accent)]"
        aria-label={`Open challenge: ${item.title}`}
      >
        {item.title}
      </Link>
    ) : playableQuizTopic ? (
      <Link
        href={`/topics/${playableQuizTopic.slug}/quizzes/play`}
        className="mt-1 block text-base font-semibold text-[var(--text)] transition hover:text-[var(--accent)]"
        aria-label={`Take the ${playableQuizTopic.name} mastery quiz`}
      >
        {item.title}
      </Link>
    ) : (
      <h3 className="mt-1 text-base font-semibold text-[var(--text)]">{item.title}</h3>
    );

  return (
    <Card className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
            {KIND_LABEL[item.kind]}
          </p>
          {titleNode}
        </div>
        <div className="flex flex-col items-end gap-1">
          {isCrossTopic ? (
            <Badge tone="accent">spans {item.topicSlugs.length} topics</Badge>
          ) : null}
          {showComingSoon ? (
            <Badge>Coming soon</Badge>
          ) : item.kind === "quiz" ? (
            <Badge tone="success">Playable</Badge>
          ) : null}
        </div>
      </div>
      <p className="text-sm leading-6 text-[var(--text-muted)]">{item.summary}</p>
      {completionTopicSlug &&
      isTrackedTopic(completionTopicSlug) &&
      (item.kind === "challenge" || item.kind === "project") ? (
        <PracticeCompletionToggle
          topicSlug={completionTopicSlug}
          itemSlug={item.slug}
          kind={item.kind}
        />
      ) : null}
      <div className="mt-auto flex flex-wrap gap-1.5">
        <Badge>{item.difficulty}</Badge>
        <Badge>
          {item.estimatedMinutes < 60
            ? `${item.estimatedMinutes}m`
            : `${Math.round(item.estimatedMinutes / 60)}h`}
        </Badge>
        {"language" in item ? <Badge>{(item as { language: string }).language}</Badge> : null}
        {"questionCount" in item ? (
          <Badge>{(item as { questionCount: number }).questionCount} questions</Badge>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1.5 text-xs">
        {tagged.slice(0, 4).map((topic) => (
          <Link
            key={topic.slug}
            href={`/topics/${topic.slug}`}
            className="rounded-md border border-[var(--border)] px-2 py-0.5 text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text)]"
          >
            {topic.name}
          </Link>
        ))}
        {tagged.length > 4 ? (
          <span className="px-2 py-0.5 text-[var(--text-muted)]">
            +{tagged.length - 4} more
          </span>
        ) : null}
      </div>
    </Card>
  );
}
