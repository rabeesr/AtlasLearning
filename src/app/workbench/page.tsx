import Link from "next/link";

import { AtlasShell } from "@/components/shared/app-shell";
import { getSourceManifestEntries, parserRegistry } from "@/lib/content/source-manifests";

export default async function WorkbenchPage() {
  const sources = await getSourceManifestEntries();

  return (
    <AtlasShell
      description="Workbench surfaces remain in the product, but they no longer define the learner brand. This area is reserved for internal operations."
      eyebrow="Workbench"
      mode="workbench"
      title="Internal tooling for ingestion, docs, and concept selection."
    >
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border-strong)] bg-[var(--atlas-panel)] p-6 shadow-[var(--atlas-glow)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">
                Source Registry
              </p>
              <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">Tracked ingestion inputs</h2>
            </div>
            <span className="rounded-full border border-[var(--atlas-border)] px-3 py-1 font-[var(--atlas-font-mono)] text-xs">
              {sources.length} sources
            </span>
          </div>
          <div className="mt-5 space-y-4">
            {sources.map((source) => (
              <article
                className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4"
                key={source.id}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-[var(--atlas-font-display)] text-2xl">{source.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-[var(--atlas-text-muted)]">{source.provenance}</p>
                  </div>
                  <span className="rounded-full border border-[var(--atlas-border)] bg-[var(--atlas-accent-soft)] px-3 py-1 font-[var(--atlas-font-mono)] text-xs uppercase tracking-[0.16em]">
                    {source.parserStatus.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--atlas-text-muted)]">{source.notes}</p>
                <p className="mt-3 font-[var(--atlas-font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
                  Linked topics: {source.linkedTopicSlugs.join(", ") || "none yet"}
                </p>
              </article>
            ))}
          </div>
        </section>

        <div className="grid gap-6">
          <section className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-6">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">Parser registry</p>
            <div className="mt-4 space-y-3">
              {parserRegistry.map((parser) => (
                <div
                  className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4"
                  key={parser.id}
                >
                  <p className="font-semibold">{parser.name}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{parser.notes}</p>
                  <p className="mt-2 font-[var(--atlas-font-mono)] text-xs uppercase tracking-[0.16em] text-[var(--atlas-text-muted)]">
                    {parser.status} | {parser.supportedSourceTypes.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-6">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">Internal routes</p>
            <div className="mt-4 space-y-3">
              <Link
                className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] px-4 py-4 text-sm transition hover:border-[var(--atlas-border-strong)]"
                href="/workbench/concepts"
              >
                Concept Lab
              </Link>
              <Link
                className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] px-4 py-4 text-sm transition hover:border-[var(--atlas-border-strong)]"
                href="/workbench/docs/curriculum-seeding-tracker"
              >
                Curriculum seeding tracker
              </Link>
              <Link
                className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] px-4 py-4 text-sm transition hover:border-[var(--atlas-border-strong)]"
                href="/workbench/docs/build-progress-tracker"
              >
                Build progress tracker
              </Link>
            </div>
          </section>
        </div>
      </div>
    </AtlasShell>
  );
}
