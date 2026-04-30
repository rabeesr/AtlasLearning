import Link from "next/link";

import { Badge, Card } from "@/components/shared/ui";
import type { CurriculumTopic, PracticeItem } from "@/types/domain";

const KIND_LABEL = { quiz: "Quiz", challenge: "Challenge", project: "Project" } as const;

export function PracticeCard({
  item,
  topicLookup,
}: {
  item: PracticeItem;
  topicLookup: Map<string, CurriculumTopic>;
}) {
  const tagged = item.topicSlugs
    .map((slug) => topicLookup.get(slug))
    .filter((t): t is CurriculumTopic => Boolean(t));
  const isCrossTopic = item.topicSlugs.length > 1;

  const titleNode =
    item.kind === "challenge" ? (
      <Link
        href={`/challenges/${item.slug}`}
        className="mt-1 block text-base font-semibold text-[var(--text)] transition hover:text-[var(--accent)]"
        aria-label={`Open challenge: ${item.title}`}
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
        {isCrossTopic ? (
          <Badge tone="accent">spans {item.topicSlugs.length} topics</Badge>
        ) : null}
      </div>
      <p className="text-sm leading-6 text-[var(--text-muted)]">{item.summary}</p>
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
