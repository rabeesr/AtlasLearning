import { KnowledgeGraphPreview } from "@/components/graph/knowledge-graph-preview";
import { AppShell } from "@/components/shared/app-shell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";

export default async function GraphPage() {
  const [user, curriculum] = await Promise.all([getCurrentUser(), getCurriculumData()]);
  const progress = await mockProgressRepository.listTopicProgress(user.id);

  return (
    <AppShell eyebrow="Knowledge Graph" title="Seeded topic structure and dependencies">
      <div className="mb-6 rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
        <p className="text-sm leading-7 text-[var(--muted)]">
          This scaffold uses a lightweight preview instead of React Flow for the initial pass. The
          curriculum loader, slug model, and user-aware status boundaries are in place so the graph
          renderer can later be swapped to React Flow without changing the content contracts.
        </p>
      </div>
      <KnowledgeGraphPreview progress={progress} topics={curriculum.topics} />
    </AppShell>
  );
}
