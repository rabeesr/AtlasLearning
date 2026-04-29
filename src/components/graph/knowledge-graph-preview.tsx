import Link from "next/link";

import type { CurriculumTopic } from "@/types/domain";
import type { TopicProgress } from "@/types/user";

function statusForTopic(topic: CurriculumTopic, progress: TopicProgress[]) {
  return progress.find((entry) => entry.topicSlug === topic.slug)?.status ?? "locked";
}

function statusClasses(status: string) {
  if (status === "completed") {
    return "border-[color:color-mix(in_srgb,var(--atlas-success)_45%,transparent)] text-[var(--atlas-success)]";
  }
  if (status === "in_progress") {
    return "border-[color:color-mix(in_srgb,var(--atlas-accent)_45%,transparent)] text-[var(--atlas-accent)]";
  }
  if (status === "decaying") {
    return "border-[color:color-mix(in_srgb,var(--atlas-warning)_45%,transparent)] text-[var(--atlas-warning)]";
  }
  if (status === "available") {
    return "border-[color:color-mix(in_srgb,var(--atlas-accent-strong)_45%,transparent)] text-[var(--atlas-accent-strong)]";
  }
  return "border-[var(--atlas-border)] text-[var(--atlas-text-muted)]";
}

export function KnowledgeGraphPreview({
  topics,
  progress,
}: {
  topics: CurriculumTopic[];
  progress: TopicProgress[];
}) {
  const broadTopics = topics.filter((topic) => topic.parentSlug === null);

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      {broadTopics.map((topic, index) => {
        const children = topics.filter((child) => child.parentSlug === topic.slug);
        const status = statusForTopic(topic, progress);

        return (
          <section
            className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-5 shadow-[var(--atlas-shadow)]"
            key={topic.slug}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">
                  Pillar 0{index + 1}
                </p>
                <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">{topic.name}</h2>
              </div>
              <span
                className={`rounded-full border px-3 py-1 font-[var(--atlas-font-mono)] text-xs uppercase tracking-[0.18em] ${statusClasses(status)}`}
              >
                {status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-[var(--atlas-text-muted)]">{topic.description}</p>
            <div className="mt-5 space-y-3">
              {children.map((child) => (
                <Link
                  className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] px-4 py-4 transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
                  href={`/topics/${child.slug}`}
                  key={child.slug}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold">{child.name}</p>
                    <span className="font-[var(--atlas-font-mono)] text-xs text-[var(--atlas-text-muted)]">
                      {child.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{child.description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
