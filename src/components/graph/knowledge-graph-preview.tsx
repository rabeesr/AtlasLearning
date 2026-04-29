import type { Route } from "next";
import Link from "next/link";

import type { CurriculumTopic } from "@/types/domain";
import type { TopicProgress } from "@/types/user";

function statusForTopic(topic: CurriculumTopic, progress: TopicProgress[]) {
  return progress.find((entry) => entry.topicSlug === topic.slug)?.status ?? "locked";
}

const statusStyles: Record<string, string> = {
  available: "border-emerald-400/40 bg-emerald-100/70 text-emerald-900",
  completed: "border-teal-500/40 bg-teal-100/70 text-teal-900",
  decaying: "border-amber-500/40 bg-amber-100/70 text-amber-900",
  in_progress: "border-sky-500/40 bg-sky-100/70 text-sky-900",
  locked: "border-slate-300/60 bg-slate-100/80 text-slate-500",
};

export function KnowledgeGraphPreview({
  topics,
  progress,
}: {
  topics: CurriculumTopic[];
  progress: TopicProgress[];
}) {
  const broadTopics = topics.filter((topic) => topic.parentSlug === null);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {broadTopics.map((topic) => {
        const children = topics.filter((child) => child.parentSlug === topic.slug);
        const status = statusForTopic(topic, progress);

        return (
          <section
            className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]"
            key={topic.slug}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted)]">
                  {topic.difficulty}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{topic.name}</h2>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.18em] ${statusStyles[status]}`}
              >
                {status.replace("_", " ")}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{topic.description}</p>
            <ul className="mt-5 space-y-3">
              {children.map((child) => (
                <li
                  className="rounded-2xl border border-[var(--card-border)] bg-white/65 px-4 py-3"
                  key={child.slug}
                >
                  <Link className="font-medium hover:text-[var(--accent)]" href={`/topics/${child.slug}` as Route}>
                    {child.name}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--muted)]">{child.description}</p>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
