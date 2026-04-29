import Link from "next/link";

import { conceptVariants } from "@/lib/ui/atlas-ui";

export function ConceptShowcase() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {conceptVariants.map((variant) => (
        <article
          className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] p-5"
          key={variant.slug}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">
                Concept Variant
              </p>
              <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">{variant.name}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{variant.tagline}</p>
            </div>
            <Link
              className="rounded-full border border-[var(--atlas-border)] px-4 py-2 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
              href={`/workbench/concepts/${variant.slug}`}
            >
              Open concept
            </Link>
          </div>
          <p className="mt-4 text-sm leading-7 text-[var(--atlas-text-muted)]">{variant.description}</p>
          <div className="mt-5 grid grid-cols-4 gap-3">
            <div className="h-14 rounded-2xl border border-[var(--atlas-border)]" style={{ background: variant.tokens.background }} />
            <div className="h-14 rounded-2xl border border-[var(--atlas-border)]" style={{ background: variant.tokens.panelAlt }} />
            <div className="h-14 rounded-2xl border border-[var(--atlas-border)]" style={{ background: variant.tokens.accent }} />
            <div className="h-14 rounded-2xl border border-[var(--atlas-border)]" style={{ background: variant.tokens.accentStrong }} />
          </div>
        </article>
      ))}
    </div>
  );
}
