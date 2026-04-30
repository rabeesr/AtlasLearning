import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge, Card, SectionHeader } from "@/components/shared/ui";
import { getCurriculumData } from "@/lib/content/curriculum";
import { getPracticeItem } from "@/lib/practice/practice-repository";
import type { ChallengeItem } from "@/types/domain";

const PLACEHOLDER_TESTS = [
  "test_basic_case",
  "test_edge_cases",
  "test_numerical_stability",
] as const;

function placeholderStarter(language: string): string {
  if (language === "Python") {
    return `# starter.py
import numpy as np


def solve(*args, **kwargs):
    """Implement your solution here."""
    # TODO: replace this stub
    return None
`;
  }
  if (language === "C++") {
    return `// starter.cpp
#include <vector>

// Implement your solution here.
// TODO: replace this stub
auto solve(/* args */) {
    return 0;
}
`;
  }
  return `// starter.${language.toLowerCase()}
// Implement your solution here.
// TODO: replace this stub
`;
}

function executionNote(language: string): string {
  if (language === "Python") {
    return "Live execution lands in Week 1 — Pyodide (CPython → WebAssembly) running in a Web Worker.";
  }
  return `Live execution for ${language} is a stretch goal — server-side via Judge0.`;
}

function formatMinutes(min: number): string {
  if (min < 60) return `${min}m`;
  const h = Math.round((min / 60) * 10) / 10;
  return `${h}h`;
}

export default async function ChallengeRunnerPage({
  params,
}: {
  params: Promise<{ challengeSlug: string }>;
}) {
  const { challengeSlug } = await params;
  const item = getPracticeItem(challengeSlug);

  if (!item || item.kind !== "challenge") {
    notFound();
  }

  const challenge = item as ChallengeItem;
  const curriculum = await getCurriculumData();
  const topicLookup = new Map(curriculum.topics.map((t) => [t.slug, t]));
  const taggedTopics = challenge.topicSlugs
    .map((slug) => topicLookup.get(slug))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const starter = placeholderStarter(challenge.language);

  return (
    <div className="space-y-8">
      <Link
        href="/challenges"
        className="inline-flex items-center gap-1.5 text-[14px] text-[var(--text-muted)] transition hover:text-[var(--accent)]"
      >
        <span aria-hidden>←</span> Back to Challenges
      </Link>

      <SectionHeader
        eyebrow="Challenge"
        title={challenge.title}
        description={challenge.summary}
        action={
          <div className="flex flex-wrap gap-2">
            <Badge tone="accent">{challenge.difficulty}</Badge>
            <Badge>{formatMinutes(challenge.estimatedMinutes)}</Badge>
            <Badge>{challenge.language}</Badge>
          </div>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* LEFT — Problem statement */}
        <Card interactive={false}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
            Problem
          </p>
          <div className="atlas-prose mt-4">
            <p>
              <em>Placeholder problem description.</em> When this challenge ships,
              this pane will render <code>problem.md</code> from{" "}
              <code>challenges/{challenge.slug}/</code> with full markdown
              support — the same renderer used by topic pages.
            </p>
            <p>
              You&apos;ll be asked to implement{" "}
              <strong>{challenge.title.toLowerCase()}</strong>. Your solution
              must pass the test cases listed in the right pane.
            </p>
            <h3>Tests</h3>
            <ul>
              {PLACEHOLDER_TESTS.map((t) => (
                <li key={t}>
                  <code>{t}</code> — placeholder
                </li>
              ))}
            </ul>
            <h3>Hints</h3>
            <ul>
              <li>Read the test file before you start coding.</li>
              <li>Edge cases matter — empty inputs, zero, negatives.</li>
              <li>Numerical stability is graded for advanced challenges.</li>
            </ul>
          </div>

          <div className="mt-6">
            <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
              Tagged topics
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {taggedTopics.map((topic) => (
                <Link
                  key={topic.slug}
                  href={`/topics/${topic.slug}`}
                  className="rounded-full border border-[var(--accent)]/40 bg-transparent px-3 py-1 text-[14px] text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  {topic.name}
                </Link>
              ))}
            </div>
          </div>
        </Card>

        {/* RIGHT — Editor + Test results */}
        <div className="flex flex-col gap-5">
          {/* Editor mock */}
          <Card interactive={false} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
                Editor · {challenge.language}
              </p>
              <p className="font-mono text-[12px] text-[var(--ink-faint)]">
                starter.{challenge.language === "Python" ? "py" : challenge.language === "C++" ? "cpp" : "c"}
              </p>
            </div>
            <pre className="overflow-x-auto rounded-[12px] bg-[#1D1D1F] px-4 py-4 font-mono text-[14px] leading-[1.6] text-[#F5F5F7]">
              <code>{starter}</code>
            </pre>
            <p className="text-center text-[13px] italic text-[var(--ink-faint)]">
              (Monaco editor will mount here)
            </p>
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                disabled
                className="inline-flex h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full bg-[var(--ink)]/40 px-6 text-[15px] font-medium text-white"
              >
                <span aria-hidden>▶</span> Run code
              </button>
              <p className="text-center text-[13px] text-[var(--text-muted)]">
                {executionNote(challenge.language)}
              </p>
            </div>
          </Card>

          {/* Test results mock */}
          <Card interactive={false}>
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
                Test results
              </p>
              <p className="text-[13px] text-[var(--ink-faint)]">0 / {PLACEHOLDER_TESTS.length} passing</p>
            </div>
            <ul className="mt-4 space-y-2.5">
              {PLACEHOLDER_TESTS.map((t) => (
                <li
                  key={t}
                  className="flex items-center gap-3 font-mono text-[14px] text-[var(--text-muted)]"
                >
                  <span
                    aria-hidden
                    className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-[var(--ink-faint)]"
                  />
                  {t}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <p className="font-mono text-[12px] uppercase tracking-wider text-[var(--ink-faint)]">
                stdout
              </p>
              <pre className="mt-2 rounded-[10px] bg-[var(--tile-deep)] px-3 py-3 font-mono text-[13px] text-[var(--ink-muted)]">
                {"(run code to see output)"}
              </pre>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
