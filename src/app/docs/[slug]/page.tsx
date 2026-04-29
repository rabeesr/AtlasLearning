import { notFound } from "next/navigation";

import { AppShell } from "@/components/shared/app-shell";
import { TopicMarkdown } from "@/components/topic/topic-markdown";
import { getProjectDoc } from "@/lib/content/docs";

export default async function ProjectDocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = await getProjectDoc(slug);

  if (!doc) {
    notFound();
  }

  return (
    <AppShell eyebrow="Project Docs" title={doc.title}>
      <section className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
        <TopicMarkdown content={doc.body} />
      </section>
    </AppShell>
  );
}
