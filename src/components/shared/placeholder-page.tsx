import type { Route } from "next";
import Link from "next/link";

import type { PlaceholderPageMeta } from "@/types/ui";

export function PlaceholderPage({ meta }: { meta: PlaceholderPageMeta }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="rounded-[var(--atlas-radius-lg)] border border-[var(--atlas-border-strong)] bg-[var(--atlas-panel)] p-6 shadow-[var(--atlas-glow)]">
        <p className="text-[10px] uppercase tracking-[0.34em] text-[var(--atlas-accent)]">{meta.journey}</p>
        <h2 className="mt-3 font-[var(--atlas-font-display)] text-3xl">{meta.title}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--atlas-text-muted)]">{meta.purpose}</p>
        <div className="mt-5 rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--atlas-accent-strong)]">
            Why this matters
          </p>
          <p className="mt-3 text-sm leading-7 text-[var(--atlas-text-muted)]">{meta.whyItMatters}</p>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Planned inputs</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
              {meta.inputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] p-5">
            <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Planned outputs</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
              {meta.outputs.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <aside className="grid gap-4">
        <section className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Readiness state</p>
          <p className="mt-3 font-[var(--atlas-font-display)] text-2xl">{meta.readiness}</p>
        </section>
        <section className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Coming next</p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-[var(--atlas-text-muted)]">
            {meta.comingNext.map((item) => (
              <li className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] px-4 py-3" key={item}>
                {item}
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-5">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--atlas-accent)]">Related surfaces</p>
          <div className="mt-3 space-y-3">
            {meta.related.map((item) => (
              <Link
                className="block rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] px-4 py-3 text-sm transition hover:border-[var(--atlas-border-strong)]"
                href={item.href as Route}
                key={item.href}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </aside>
    </div>
  );
}
