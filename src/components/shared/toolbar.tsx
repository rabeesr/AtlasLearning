"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const primaryLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/topics", label: "Topics" },
  { href: "/quizzes", label: "Quizzes" },
  { href: "/challenges", label: "Challenges" },
  { href: "/projects", label: "Projects" },
] as const;

export function Toolbar() {
  const pathname = usePathname() ?? "";

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[rgba(7,17,31,0.85)] backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-6 px-4 md:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm font-semibold tracking-[0.28em] text-[var(--accent)]">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-[var(--accent-soft)] text-[var(--accent)]">A</span>
          ATLAS
        </Link>
        <nav className="flex flex-1 items-center gap-1">
          {primaryLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 text-sm transition ${
                  active
                    ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "text-[var(--text-muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--text)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/settings"
          className={`rounded-md px-3 py-1.5 text-sm transition ${
            isActive("/settings")
              ? "bg-[var(--accent-soft)] text-[var(--accent)]"
              : "text-[var(--text-muted)] hover:bg-[var(--panel-muted)] hover:text-[var(--text)]"
          }`}
        >
          Settings
        </Link>
      </div>
    </header>
  );
}
