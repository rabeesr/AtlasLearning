"use client";

import Image from "next/image";
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

  function navLinkClass(active: boolean) {
    return [
      "h-full px-3 inline-flex items-center font-mono uppercase tracking-[0.12em] text-[11px] border-b-2 transition-colors duration-100",
      active
        ? "text-[var(--ink-strong)] border-[var(--accent)]"
        : "text-[var(--ink-muted)] border-transparent hover:text-[var(--ink)] hover:border-[var(--rule-soft)]",
    ].join(" ");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--ink)] bg-[var(--bg-white)]/85 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-stretch gap-0 px-4 md:px-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 pr-5 mr-2 border-r border-[var(--ink)]"
          aria-label="ATLAS Learning home"
        >
          <span className="block h-9 w-[60px] border border-[var(--ink)] bg-[var(--bg-white)] overflow-hidden relative">
            <Image
              src="/atlas-logo.png"
              alt="ATLAS Learning"
              fill
              sizes="60px"
              priority
              className="object-cover"
            />
          </span>
        </Link>
        <nav className="flex flex-1 items-stretch gap-0">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={navLinkClass(isActive(link.href))}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/settings"
          className={navLinkClass(isActive("/settings"))}
        >
          Settings
        </Link>
      </div>
    </header>
  );
}
