"use client";

import { useState } from "react";

import type { ChallengeTest, ChallengeTestResult } from "@/types/practice";

/**
 * Expandable row in the test-results panel. Collapsed: name + status dot +
 * duration (if known). Expanded: Python source, assertion error, and any
 * captured stdout for just this test. Soft Apple aesthetic — no borders,
 * #F5F5F7 expanded body, 200ms ease.
 */
export function ChallengeTestRow({
  test,
  result,
  onRunSingle,
  canRun,
}: {
  test: ChallengeTest;
  result?: ChallengeTestResult;
  onRunSingle?: () => void;
  canRun: boolean;
}) {
  const [open, setOpen] = useState(false);

  let dotClass = "border border-[var(--ink-faint)]";
  if (result?.passed) {
    dotClass = "bg-[var(--success)]";
  } else if (result && !result.passed) {
    dotClass = "bg-[var(--danger)]";
  }

  return (
    <li className="overflow-hidden rounded-[14px] bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F5F5F7]"
      >
        <span
          aria-hidden
          className={`inline-flex h-3.5 w-3.5 flex-none rounded-full ${dotClass}`}
        />
        <span className="font-mono text-[14px] text-[var(--ink)]">
          {test.name}
        </span>
        <span className="ml-auto flex items-center gap-3">
          {result?.durationMs !== undefined ? (
            <span className="font-mono text-[11px] tabular-nums text-[var(--ink-faint)]">
              {result.durationMs}ms
            </span>
          ) : null}
          {onRunSingle && canRun ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onRunSingle();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  e.preventDefault();
                  onRunSingle();
                }
              }}
              title="Run only this test"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--tile)] text-[var(--ink-muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
            >
              <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden>
                <path d="M3 2.5v7l6-3.5z" fill="currentColor" />
              </svg>
            </span>
          ) : null}
          <Chevron open={open} />
        </span>
      </button>
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3 bg-[#F5F5F7] px-5 py-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                Test source
              </p>
              <pre className="mt-1.5 whitespace-pre-wrap rounded-[10px] bg-white px-3 py-2 font-mono text-[12px] leading-5 text-[var(--ink)]">
                {test.code}
              </pre>
            </div>
            {result?.errorMessage ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--danger)]">
                  Assertion / error
                </p>
                <pre className="mt-1.5 whitespace-pre-wrap rounded-[10px] bg-[color-mix(in_srgb,var(--danger)_8%,white)] px-3 py-2 font-mono text-[12px] leading-5 text-[var(--danger)]">
                  {result.errorMessage}
                </pre>
              </div>
            ) : null}
            {result?.stdout ? (
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                  Captured stdout
                </p>
                <pre className="mt-1.5 whitespace-pre-wrap rounded-[10px] bg-white px-3 py-2 font-mono text-[12px] leading-5 text-[var(--ink-muted)]">
                  {result.stdout}
                </pre>
              </div>
            ) : null}
            {!result ? (
              <p className="text-[12px] text-[var(--ink-faint)]">
                Run the code to see this test&rsquo;s result.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 12 12"
      className={`h-3 w-3 text-[var(--ink-faint)] transition-transform duration-200 ${
        open ? "rotate-180" : "rotate-0"
      }`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 4.5l3.5 3.5 3.5-3.5" />
    </svg>
  );
}
