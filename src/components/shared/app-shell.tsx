import type { CSSProperties, ReactNode } from "react";
import type { Route } from "next";
import Link from "next/link";

import { conceptVariants, learnerNavGroups, learnerTheme, workbenchNavItems } from "@/lib/ui/atlas-ui";
import type { ConceptVariant, ThemeTokens } from "@/types/ui";

function themeStyle(tokens: ThemeTokens): CSSProperties {
  return {
    ["--atlas-bg" as string]: tokens.background,
    ["--atlas-bg-alt" as string]: tokens.backgroundAlt,
    ["--atlas-panel" as string]: tokens.panel,
    ["--atlas-panel-alt" as string]: tokens.panelAlt,
    ["--atlas-panel-muted" as string]: tokens.panelMuted,
    ["--atlas-border" as string]: tokens.border,
    ["--atlas-border-strong" as string]: tokens.borderStrong,
    ["--atlas-text" as string]: tokens.text,
    ["--atlas-text-muted" as string]: tokens.textMuted,
    ["--atlas-accent" as string]: tokens.accent,
    ["--atlas-accent-strong" as string]: tokens.accentStrong,
    ["--atlas-accent-soft" as string]: tokens.accentSoft,
    ["--atlas-success" as string]: tokens.success,
    ["--atlas-warning" as string]: tokens.warning,
    ["--atlas-danger" as string]: tokens.danger,
    ["--atlas-shadow" as string]: tokens.shadow,
    ["--atlas-glow" as string]: tokens.glow,
    ["--atlas-font-display" as string]: tokens.displayFont,
    ["--atlas-font-body" as string]: tokens.bodyFont,
    ["--atlas-font-mono" as string]: tokens.monoFont,
    ["--atlas-radius" as string]: tokens.radius,
    ["--atlas-radius-lg" as string]: tokens.radiusLarge,
    ["--atlas-stroke" as string]: tokens.strokeWidth,
  };
}

function ShellPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel)] shadow-[var(--atlas-shadow)] backdrop-blur ${className}`}
    >
      {children}
    </div>
  );
}

function LearnerNavigation() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {learnerNavGroups.map((group) => (
        <ShellPanel className="p-4" key={group.id}>
          <p className="text-[10px] uppercase tracking-[0.36em] text-[var(--atlas-accent)]">
            {group.label}
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">{group.description}</p>
          <div className="mt-4 space-y-2">
            {group.items.map((item) => (
              <Link
                className="block rounded-2xl border border-[var(--atlas-border)] bg-[var(--atlas-panel-muted)] px-3 py-3 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
                href={item.href as Route}
                key={item.href}
              >
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--atlas-text-muted)]">{item.description}</p>
              </Link>
            ))}
          </div>
        </ShellPanel>
      ))}
    </div>
  );
}

function WorkbenchNavigation() {
  return (
    <ShellPanel className="p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.36em] text-[var(--atlas-accent)]">
            Workbench
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--atlas-text-muted)]">
            Internal tooling for curriculum ingestion, project tracking, and design exploration.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {workbenchNavItems.map((item) => (
            <Link
              className="rounded-full border border-[var(--atlas-border)] px-4 py-2 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
              href={item.href as Route}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </ShellPanel>
  );
}

function VariantStrip() {
  return (
    <div className="flex flex-wrap gap-2">
      {conceptVariants.map((variant) => (
        <Link
          className="rounded-full border border-[var(--atlas-border)] px-4 py-2 text-sm transition hover:border-[var(--atlas-border-strong)] hover:bg-[var(--atlas-accent-soft)]"
          href={`/workbench/concepts/${variant.slug}` as Route}
          key={variant.slug}
        >
          {variant.name}
        </Link>
      ))}
    </div>
  );
}

export function AtlasShell({
  eyebrow,
  title,
  description,
  children,
  mode = "learner",
  variant,
  aside,
  showNavigation = true,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  mode?: "learner" | "workbench" | "concept";
  variant?: ConceptVariant;
  aside?: ReactNode;
  showNavigation?: boolean;
}) {
  const tokens = variant?.tokens ?? learnerTheme;

  return (
    <div className="min-h-screen bg-[var(--atlas-bg)] text-[var(--atlas-text)]" style={themeStyle(tokens)}>
      <div className="atlas-background">
        <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col gap-6 px-4 py-4 md:px-7 md:py-7">
          <ShellPanel className="overflow-hidden">
            <div className="grid gap-6 px-5 py-5 md:px-7 md:py-7 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.38em] text-[var(--atlas-accent)]">
                  <span>ATLAS</span>
                  <span className="h-px w-12 bg-[var(--atlas-border-strong)]" />
                  <span>{eyebrow}</span>
                </div>
                <div>
                  <h1 className="max-w-4xl font-[var(--atlas-font-display)] text-4xl leading-tight md:text-6xl">
                    {title}
                  </h1>
                  <p className="mt-4 max-w-3xl font-[var(--atlas-font-body)] text-sm leading-7 text-[var(--atlas-text-muted)] md:text-base">
                    {description}
                  </p>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-[calc(var(--atlas-radius)-6px)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
                  <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--atlas-accent-strong)]">
                    Current framing
                  </p>
                  <p className="mt-3 font-[var(--atlas-font-display)] text-xl">
                    {variant?.name ?? "Learner dashboard + topic hubs"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
                    {variant?.tagline ??
                      "A curriculum-first flow: domain visibility on the dashboard, then consistent Learn, Quiz, Challenge, and Review actions inside each topic."}
                  </p>
                </div>
                {aside ? <div>{aside}</div> : null}
                {mode === "concept" ? <VariantStrip /> : null}
              </div>
            </div>
          </ShellPanel>

          {showNavigation && mode === "learner" ? <LearnerNavigation /> : null}
          {showNavigation && mode === "workbench" ? <WorkbenchNavigation /> : null}
          {showNavigation && mode === "concept" ? <WorkbenchNavigation /> : null}

          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
