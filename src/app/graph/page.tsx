import { KnowledgeGraphPreview } from "@/components/graph/knowledge-graph-preview";
import { AtlasShell } from "@/components/shared/app-shell";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";

export default async function GraphPage() {
  const { curriculum, dashboard } = await getLearnerDashboardView();

  return (
    <AtlasShell
      description="The graph is now a supporting dependency view. Use it to explain readiness, unlocks, and why a topic is still blocked."
      eyebrow="Knowledge Graph"
      title="See the dependency structure behind the learner dashboard."
    >
      <div className="grid gap-6">
        <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border-strong)] bg-[var(--atlas-panel)] p-6 shadow-[var(--atlas-glow)]">
          <p className="text-sm leading-7 text-[var(--atlas-text-muted)]">
            Topics, prerequisite blocks, and downstream unlocks all resolve from the same learner
            contracts as the dashboard and topic hubs. This page supports planning; it no longer
            acts as the main learner landing surface.
          </p>
        </section>
        <KnowledgeGraphPreview summaries={dashboard.summaries} topics={curriculum.topics} />
      </div>
    </AtlasShell>
  );
}
