import Link from "next/link";

import { AppShell } from "@/components/shared/app-shell";
import { getSourceManifestEntries, parserRegistry } from "@/lib/content/source-manifests";

export default async function SettingsPage() {
  const sources = await getSourceManifestEntries();

  return (
    <AppShell eyebrow="Scaffold Status" title="Track ingestion, parsers, and engineering progress">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
          <h2 className="text-2xl font-semibold">Source ingestion registry</h2>
          <div className="mt-5 space-y-4">
            {sources.map((source) => (
              <article className="rounded-2xl border border-[var(--card-border)] bg-white/70 p-4" key={source.id}>
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{source.title}</h3>
                    <p className="text-sm text-[var(--muted)]">{source.provenance}</p>
                  </div>
                  <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[var(--accent-strong)]">
                    {source.parserStatus.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{source.notes}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  Linked topics: {source.linkedTopicSlugs.join(", ") || "none yet"}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-2xl font-semibold">Parser registry</h2>
            <ul className="mt-4 space-y-3">
              {parserRegistry.map((parser) => (
                <li className="rounded-2xl border border-[var(--card-border)] bg-white/70 p-4" key={parser.id}>
                  <p className="font-medium">{parser.name}</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">{parser.notes}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {parser.status} | {parser.supportedSourceTypes.join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-[var(--shadow)]">
            <h2 className="text-2xl font-semibold">Project trackers</h2>
            <div className="mt-4 space-y-3 text-sm">
              <Link className="block rounded-2xl border border-[var(--card-border)] bg-white/70 p-4 hover:border-[var(--accent)]" href="/docs/curriculum-seeding-tracker">
                Curriculum seeding tracker
              </Link>
              <Link className="block rounded-2xl border border-[var(--card-border)] bg-white/70 p-4 hover:border-[var(--accent)]" href="/docs/build-progress-tracker">
                Build progress tracker
              </Link>
            </div>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
