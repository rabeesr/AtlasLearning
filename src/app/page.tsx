import Link from "next/link";
import { ArrowRight, FileStack, Network, Pickaxe } from "lucide-react";

import { KnowledgeGraphPreview } from "@/components/graph/knowledge-graph-preview";
import { AppShell } from "@/components/shared/app-shell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import { getSourceManifestEntries, parserRegistry } from "@/lib/content/source-manifests";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";

export default async function HomePage() {
  const [user, curriculum, sources] = await Promise.all([
    getCurrentUser(),
    getCurriculumData(),
    getSourceManifestEntries(),
  ]);
  const progress = await mockProgressRepository.listTopicProgress(user.id);

  return (
    <AppShell eyebrow="ATLAS Scaffold" title="Build the learning engine before the curriculum scale-up.">
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
            <Network className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="mt-4 text-xl font-semibold">Curriculum-first routing</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Seed topics, dependencies, and topic content all load from the filesystem using stable
              slugs so the graph, topic pages, and future progress engine share one vocabulary.
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
            <Pickaxe className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="mt-4 text-xl font-semibold">Ingestion-aware authoring</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Raw sources are tracked explicitly so every new PDF, slide deck, or repo can be mapped
              to a parser path instead of disappearing into ad hoc notes.
            </p>
          </article>
          <article className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]">
            <FileStack className="h-6 w-6 text-[var(--accent)]" />
            <h2 className="mt-4 text-xl font-semibold">User-aware boundaries</h2>
            <p className="mt-2 text-sm leading-7 text-[var(--muted)]">
              Auth and storage are stubbed, but the code already models per-user progress,
              challenges, and quizzes so later Clerk and Supabase work stays incremental.
            </p>
          </article>
        </section>

        <section className="rounded-[2rem] border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-[var(--muted)]">Seed status</p>
              <h2 className="mt-2 text-2xl font-semibold">
                {curriculum.topics.length} topics across {parserRegistry.length} parser tracks
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)]">
                Signed in as <strong>{user.displayName}</strong> via the demo user abstraction.{" "}
                {sources.length} raw source manifests are registered for robotics ingestion.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                className="inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[var(--accent-strong)]"
                href="/graph"
              >
                Open graph
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-[var(--card-border)] px-5 py-3 text-sm font-medium hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                href="/settings"
              >
                View scaffolding status
              </Link>
            </div>
          </div>
        </section>

        <KnowledgeGraphPreview progress={progress} topics={curriculum.topics} />
      </div>
    </AppShell>
  );
}
