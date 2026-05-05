"use client";

import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
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
  const { isSignedIn, isLoaded } = useAuth();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard" || pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function navLinkClass(active: boolean) {
    return [
      "inline-flex items-center rounded-full px-4 py-2 text-[15px] font-medium transition-all duration-200 ease-out",
      active
        ? "bg-[var(--tile)] text-[var(--ink-strong)] font-semibold"
        : "text-[var(--ink-muted)] hover:bg-[var(--tile)] hover:text-[var(--ink)]",
    ].join(" ");
  }

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-32 w-full max-w-[1400px] items-center gap-5 px-4 md:px-8">
        <Link
          href="/dashboard"
          className="group flex items-center gap-2.5 transition-opacity duration-200 hover:opacity-80"
          aria-label="ATLAS Learning home"
        >
          <span className="relative block h-28 w-28 overflow-hidden rounded-[20px]">
            <Image
              src="/atlas-logo.png"
              alt=""
              fill
              sizes="112px"
              priority
              className="object-cover"
            />
          </span>
          <span className="text-[20px] font-semibold tracking-tight text-[var(--ink-strong)]">
            ATLAS
          </span>
        </Link>

        <nav className="ml-2 flex flex-1 items-center gap-1">
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

        <Link href="/settings" className={navLinkClass(isActive("/settings"))}>
          Settings
        </Link>

        <div className="ml-2 flex items-center">
          {!isLoaded ? null : isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-full bg-[var(--ink)] px-4 text-[14px] font-medium text-white transition-colors duration-200 hover:bg-black"
              >
                Sign in
              </button>
            </SignInButton>
          )}
        </div>
      </div>
    </header>
  );
}
