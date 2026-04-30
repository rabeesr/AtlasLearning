"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

export function TopicTabs({
  topicSlug,
  hasLearn,
  hasQuiz,
  hasChallenge,
  hasProject,
}: {
  topicSlug: string;
  hasLearn: boolean;
  hasQuiz: boolean;
  hasChallenge: boolean;
  hasProject: boolean;
}) {
  const pathname = usePathname() ?? "";
  const base = `/topics/${topicSlug}`;

  const tabs: Array<{ href: string; label: string; show: boolean }> = [
    { href: base, label: "Overview", show: true },
    { href: `${base}/learn`, label: "Learn", show: hasLearn },
    { href: `${base}/quizzes`, label: "Quizzes", show: hasQuiz },
    { href: `${base}/challenges`, label: "Coding Challenges", show: hasChallenge },
    { href: `${base}/projects`, label: "Projects", show: hasProject },
  ];

  return (
    <div className="flex flex-wrap gap-1 border-b border-[var(--border)]">
      {tabs
        .filter((tab) => tab.show)
        .map((tab) => {
          const active =
            tab.href === base
              ? pathname === base
              : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href as Route}
              className={`relative -mb-px border-b-2 px-3 py-2 text-sm transition ${
                active
                  ? "border-[var(--accent)] text-[var(--accent)]"
                  : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
    </div>
  );
}
