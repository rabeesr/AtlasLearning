import { notFound } from "next/navigation";

import { AtlasShell } from "@/components/shared/app-shell";
import { getProjectDoc } from "@/lib/content/docs";
import { TopicMarkdown } from "@/components/topic/topic-markdown";

export default async function WorkbenchDocPage({
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
    <AtlasShell
      description="Project documentation and trackers are still available, but under the workbench where they belong."
      eyebrow="Project Docs"
      mode="workbench"
      title={doc.title}
    >
      <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border-strong)] bg-[var(--atlas-panel)] p-6 shadow-[var(--atlas-glow)]">
        <div className="atlas-prose">
          <TopicMarkdown content={doc.body} />
        </div>
      </section>
    </AtlasShell>
  );
}
