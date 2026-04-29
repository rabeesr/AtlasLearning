import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/shared/app-shell";
import { TopicMarkdown } from "@/components/topic/topic-markdown";
import { getChildTopics, getTopicBySlug } from "@/lib/content/curriculum";
import { getTopicContent } from "@/lib/content/topic-content";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const [topic, topicContent, childTopics] = await Promise.all([
    getTopicBySlug(topicSlug),
    getTopicContent(topicSlug),
    getChildTopics(topicSlug),
  ]);

  if (!topic) {
    notFound();
  }

  return (
    <AppShell eyebrow="Topic" title={topic.name}>
      <div className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">
        <aside className="space-y-6">
          <section className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">{topic.difficulty}</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{topic.description}</p>
            <div className="mt-5">
              <p className="text-sm font-medium">Dependencies</p>
              <ul className="mt-2 space-y-2 text-sm text-[var(--muted)]">
                {topic.dependencySlugs.length > 0 ? (
                  topic.dependencySlugs.map((dependency) => <li key={dependency}>{dependency}</li>)
                ) : (
                  <li>No prerequisites tracked yet.</li>
                )}
              </ul>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
            <p className="text-sm font-medium">Children</p>
            <ul className="mt-3 space-y-3">
              {childTopics.length > 0 ? (
                childTopics.map((child) => (
                  <li className="rounded-2xl border border-[var(--card-border)] bg-white/70 p-3" key={child.slug}>
                    <Link className="font-medium hover:text-[var(--accent)]" href={`/topics/${child.slug}` as Route}>
                      {child.name}
                    </Link>
                    <p className="mt-1 text-sm text-[var(--muted)]">{child.description}</p>
                  </li>
                ))
              ) : (
                <li className="text-sm text-[var(--muted)]">No child topics for this node.</li>
              )}
            </ul>
          </section>
        </aside>

        <section className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
          {topicContent ? (
            <>
              <p className="text-sm leading-7 text-[var(--muted)]">{topicContent.summary}</p>
              <div className="mt-5 rounded-2xl bg-white/70 p-4">
                <p className="text-sm font-medium">Learning objectives</p>
                <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
                  {topicContent.learningObjectives.map((objective) => (
                    <li key={objective}>{objective}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-6">
                <TopicMarkdown content={topicContent.body} />
              </div>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-lg font-semibold">Topic content not seeded yet</p>
              <p className="text-sm leading-7 text-[var(--muted)]">
                The curriculum node exists, but its detailed markdown file has not been authored yet.
                Track the gap in the curriculum seeding document before adding this topic.
              </p>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
