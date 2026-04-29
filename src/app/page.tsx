import Link from "next/link";
import type { Route } from "next";

import { KnowledgeGraphPreview } from "@/components/graph/knowledge-graph-preview";
import { AtlasShell } from "@/components/shared/app-shell";
import { ConceptShowcase } from "@/components/shared/concept-showcase";
import { FlagshipDashboard } from "@/components/shared/flagship-surfaces";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import { getSourceManifestEntries } from "@/lib/content/source-manifests";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";

export default async function HomePage() {
  const [user, curriculum, sources] = await Promise.all([
    getCurrentUser(),
    getCurriculumData(),
    getSourceManifestEntries(),
  ]);
  const progress = await mockProgressRepository.listTopicProgress(user.id);

  return (
    <AtlasShell
      description="ATLAS is now framed as a learner-facing operating system: visible topology, explicit next action, and a separate workbench for internal tooling."
      eyebrow="Learner Mission"
      showNavigation={false}
      title="A scientific operating system for deep technical learning."
      aside={
        <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--atlas-accent-strong)]">
            Operator snapshot
          </p>
          <p className="mt-3 font-[var(--atlas-font-display)] text-xl">{user.displayName}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
            {curriculum.topics.length} curriculum nodes, {sources.length} tracked sources, and a workbench
            reserved for internal architecture.
          </p>
        </div>
      }
    >
      <div className="grid gap-6">
        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border-strong)] bg-[var(--atlas-panel)] p-6 shadow-[var(--atlas-glow)]">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">Mission brief</p>
            <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">
              Start from the learner mission, then branch into the product surfaces.
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--atlas-text-muted)]">
              Learner-facing navigation is organized by journey: learn, practice, review, research, and
              career. Ingestion status, docs, and implementation scaffolding are isolated in the workbench.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-[var(--atlas-accent)] px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90"
                href="/dashboard"
              >
                Enter dashboard
              </Link>
              <Link
                className="rounded-full border border-[var(--atlas-border)] px-5 py-3 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
                href="/concepts"
              >
                Compare concept variants
              </Link>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              {[
                ["Learn", "Dashboard, graph, and deep-dive pages stay focused on concept structure."],
                ["Practice", "Challenges, quizzes, capstones, and simulator routes are visible now."],
                ["Research", "Tutor, paper reader, and textbook mode sit beside the study flow."],
              ].map(([label, detail]) => (
                <div
                  className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] p-4"
                  key={label}
                >
                  <p className="font-[var(--atlas-font-display)] text-xl">{label}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-6">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">Where to look</p>
              <div className="mt-4 space-y-3">
                {[
                  ["/dashboard", "Main learner dashboard"],
                  ["/topics/linear-algebra-robotics", "Flagship topic deep dive"],
                  ["/concepts", "All four design variants"],
                  ["/workbench", "Internal tooling and docs"],
                ].map(([href, label]) => (
                  <Link
                    className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] px-4 py-4 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
                    href={href as Route}
                    key={href}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-6">
              <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">Roadmap exposure</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-1">
                {[
                  ["Review", "Spaced repetition, briefings, analytics"],
                  ["Career", "Interview prep and application tools"],
                ].map(([label, detail]) => (
                  <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] p-4" key={label}>
                    <p className="font-[var(--atlas-font-display)] text-xl">{label}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">
                Design Variants
              </p>
              <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">
                The four visual systems are here, side by side.
              </h2>
            </div>
            <Link
              className="rounded-full border border-[var(--atlas-border)] px-4 py-2 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
              href="/concepts"
            >
              Open concept lab
            </Link>
          </div>
          <div className="mt-5">
            <ConceptShowcase />
          </div>
        </section>

        <FlagshipDashboard curriculum={curriculum} progress={progress} />

        <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">
                Knowledge frontier
              </p>
              <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">Current domain topology</h2>
            </div>
            <Link
              className="rounded-full border border-[var(--atlas-border)] px-4 py-2 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
              href="/graph"
            >
              Expand graph
            </Link>
          </div>
          <div className="mt-5">
            <KnowledgeGraphPreview progress={progress} topics={curriculum.topics} />
          </div>
        </section>
      </div>
    </AtlasShell>
  );
}
