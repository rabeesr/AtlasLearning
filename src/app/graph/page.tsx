import { KnowledgeGraphPreview } from "@/components/graph/knowledge-graph-preview";
import { AtlasShell } from "@/components/shared/app-shell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";

export default async function GraphPage() {
  const [user, curriculum] = await Promise.all([getCurrentUser(), getCurriculumData()]);
  const progress = await mockProgressRepository.listTopicProgress(user.id);

  return (
    <AtlasShell
      description="The graph page stays lightweight for now, but the experience is framed as a live knowledge map rather than a scaffold demo."
      eyebrow="Knowledge Graph"
      title="See the topology before choosing the next study push."
    >
      <div className="grid gap-6">
        <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border-strong)] bg-[var(--atlas-panel)] p-6 shadow-[var(--atlas-glow)]">
          <p className="text-sm leading-7 text-[var(--atlas-text-muted)]">
            Topic structure, dependencies, and learner state all resolve from the same curriculum
            contracts. The visual renderer can become richer later without changing the educational
            model beneath it.
          </p>
        </section>
        <KnowledgeGraphPreview progress={progress} topics={curriculum.topics} />
      </div>
    </AtlasShell>
  );
}
