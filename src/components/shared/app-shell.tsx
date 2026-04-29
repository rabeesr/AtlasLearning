import type { Route } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "Overview" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/graph", label: "Graph" },
  { href: "/settings", label: "Settings" },
] satisfies Array<{ href: Route; label: string }>;

export function AppShell({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen px-5 py-6 md:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="rounded-[2rem] border border-[var(--card-border)] bg-[var(--card)] px-6 py-5 shadow-[var(--shadow)] backdrop-blur">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.32em] text-[var(--accent-strong)]">
                {eyebrow ?? "ATLAS Learning OS"}
              </p>
              <div>
                <h1 className="text-3xl font-semibold md:text-5xl">{title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-base">
                  A local-first scaffold for a domain-driven learning platform with filesystem
                  curriculum content, user-aware progress boundaries, and source-ingestion tracking.
                </p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  className="rounded-full border border-[var(--card-border)] px-4 py-2 text-sm transition hover:border-[var(--accent)] hover:bg-[var(--accent-soft)]"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
