"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { ChallengeAttemptsPanel } from "@/components/practice/challenge-attempts-panel";
import { ChallengeHints } from "@/components/practice/challenge-hints";
import { ChallengeTestRow } from "@/components/practice/challenge-test-row";
import { Badge, Button, Card } from "@/components/shared/ui";
import { TopicMarkdown } from "@/components/topic/topic-markdown";
import { useChallengeTracker } from "@/lib/practice/challenge-tracker";
import { usePyodideRunner } from "@/lib/pyodide/use-pyodide-runner";
import type { CodingChallenge, ChallengeTest } from "@/types/practice";

// Monaco is heavy and browser-only — never SSR it.
const MonacoEditor = dynamic(
  () => import("@monaco-editor/react").then((m) => m.default),
  { ssr: false, loading: () => <EditorSkeleton /> },
);

function EditorSkeleton() {
  return (
    <div className="flex h-[420px] items-center justify-center rounded-[18px] bg-[#1D1D1F] text-[13px] text-[#F5F5F7]/70">
      Loading editor…
    </div>
  );
}

export function ChallengeRunner({ challenge }: { challenge: CodingChallenge }) {
  const tracker = useChallengeTracker(challenge.slug);
  const runner = usePyodideRunner();

  const [code, setCode] = useState<string>(challenge.starterCode);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [gaveUp, setGaveUp] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [copied, setCopied] = useState(false);
  const [attemptsRefreshKey, setAttemptsRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    tracker.startAttempt().then((id) => {
      if (!cancelled) setAttemptId(id);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.slug]);

  const passed = useMemo(() => {
    if (!runner.lastResults) return 0;
    return runner.lastResults.filter((r) => r.passed).length;
  }, [runner.lastResults]);

  const canReveal = hasSubmitted || gaveUp;
  const canRun = runner.status === "ready" || runner.status === "running";

  const onRun = async () => {
    const outcome = await runner.run(code, challenge.tests, challenge.pythonPackages);
    if (outcome && attemptId) {
      setHasSubmitted(true);
      await tracker.recordRun(attemptId, outcome.results, code);
      setAttemptsRefreshKey((k) => k + 1);
    }
  };

  const onRunSingleTest = async (test: ChallengeTest) => {
    await runner.runTest(code, test, challenge.pythonPackages);
  };

  const onReveal = async () => {
    setShowSolution(true);
    if (attemptId) {
      await tracker.markRevealed(attemptId);
      setAttemptsRefreshKey((k) => k + 1);
    }
  };

  const onGiveUp = () => setGaveUp(true);

  const isDirty = code !== challenge.starterCode;

  const onReset = () => {
    if (!isDirty) {
      setCode(challenge.starterCode);
      return;
    }
    setConfirmReset(true);
  };
  const confirmResetYes = () => {
    setCode(challenge.starterCode);
    setConfirmReset(false);
  };
  const confirmResetNo = () => setConfirmReset(false);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked — silent failure is fine.
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* LEFT — Problem + hints */}
      <Card interactive={false}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          Problem
        </p>
        <div className="mt-4">
          <TopicMarkdown content={challenge.problemMarkdown} />
        </div>
        {challenge.hints && challenge.hints.length > 0 ? (
          <ChallengeHints
            challengeSlug={challenge.slug}
            hints={challenge.hints}
          />
        ) : null}
      </Card>

      {/* RIGHT — Editor + results */}
      <div className="flex flex-col gap-5">
        <Card interactive={false} className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
              Editor · Python
            </p>
            <RunnerStatusPill status={runner.status} progress={runner.progress} />
          </div>

          <div className="overflow-hidden rounded-[18px] bg-[#1D1D1F]">
            <MonacoEditor
              height="420px"
              defaultLanguage="python"
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily:
                  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: "on",
              }}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={onRun}
                variant="primary"
                className={canRun ? "" : "pointer-events-none opacity-50"}
              >
                {runner.status === "running" ? "Running…" : "Run code"}
              </Button>
              {confirmReset ? (
                <span className="inline-flex items-center gap-2 rounded-full bg-[var(--tile)] px-3 py-1 text-[13px] text-[var(--ink)]">
                  Reset?
                  <button
                    type="button"
                    onClick={confirmResetYes}
                    className="rounded-full bg-[var(--ink)] px-2.5 py-0.5 text-[12px] font-medium text-white hover:bg-black"
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={confirmResetNo}
                    className="rounded-full bg-white px-2.5 py-0.5 text-[12px] font-medium text-[var(--ink-muted)] hover:text-[var(--ink)]"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <Button onClick={onReset} variant="secondary" size="sm">
                  Reset
                </Button>
              )}
              <Button onClick={onCopy} variant="secondary" size="sm">
                {copied ? "Copied" : "Copy"}
              </Button>
              {!gaveUp && !hasSubmitted ? (
                <Button onClick={onGiveUp} variant="ghost">
                  Give up
                </Button>
              ) : null}
              <Button
                onClick={onReveal}
                variant="secondary"
                className={
                  canReveal && !showSolution
                    ? ""
                    : "pointer-events-none opacity-40"
                }
              >
                Show example solution
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {runner.totalMs !== null ? (
                <span className="font-mono text-[12px] tabular-nums text-[var(--ink-faint)]">
                  {runner.totalMs}ms
                </span>
              ) : null}
              {runner.lastResults ? (
                <Badge tone={passed === runner.lastResults.length ? "success" : "neutral"}>
                  {passed} / {runner.lastResults.length} passing
                </Badge>
              ) : null}
            </div>
          </div>
        </Card>

        {/* Test results */}
        <Card interactive={false}>
          <div className="flex items-center justify-between">
            <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
              Test results
            </p>
            <p className="text-[13px] text-[var(--ink-faint)]">
              {runner.lastResults
                ? `${passed} / ${runner.lastResults.length} passing`
                : `0 / ${challenge.tests.length} run`}
            </p>
          </div>
          <ul className="mt-4 space-y-2.5">
            {challenge.tests.map((t) => {
              const result = runner.lastResults?.find(
                (r) => r.testName === t.name,
              );
              return (
                <ChallengeTestRow
                  key={t.name}
                  test={t}
                  result={result}
                  canRun={canRun}
                  onRunSingle={() => onRunSingleTest(t)}
                />
              );
            })}
          </ul>
        </Card>

        {/* Console / errors — grouped by origin */}
        <Card interactive={false}>
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
            Console
          </p>
          {runner.error ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-[14px] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-4 py-3 font-mono text-[13px] leading-6 text-[var(--danger)]">
              Pyodide failed to load: {runner.error}
            </pre>
          ) : null}
          {runner.traceback ? (
            <pre className="mt-3 whitespace-pre-wrap rounded-[14px] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-4 py-3 font-mono text-[13px] leading-6 text-[var(--danger)]">
{runner.traceback}
            </pre>
          ) : null}
          {runner.consoleLines.length > 0 ? (
            <div className="mt-3 max-h-[320px] space-y-2 overflow-auto">
              {runner.consoleLines.map((line, i) => (
                <div key={i} className="rounded-[14px] bg-[var(--tile-deep)] px-4 py-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                    {line.origin === "user" ? "user code" : `test · ${line.origin}`}
                  </p>
                  <pre className="mt-1.5 whitespace-pre-wrap font-mono text-[13px] leading-6 text-[var(--ink-muted)]">
                    {line.text}
                  </pre>
                </div>
              ))}
            </div>
          ) : (
            <pre className="mt-3 rounded-[14px] bg-[var(--tile-deep)] px-4 py-3 font-mono text-[13px] leading-6 text-[var(--ink-muted)]">
              {runner.stdout || "(run code to see output)"}
            </pre>
          )}

          {/* Inline matplotlib plots — visualization-hook bonus feature. */}
          {runner.plots.length > 0 ? (
            <div className="mt-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                Plots ({runner.plots.length})
              </p>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {runner.plots.map((p, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-[14px] bg-white p-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`data:image/png;base64,${p.pngBase64}`}
                      alt={`Plot ${i + 1}`}
                      className="block w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </Card>

        {/* Attempt history (signed-in only — hidden otherwise) */}
        <ChallengeAttemptsPanel
          challengeSlug={challenge.slug}
          totalTests={challenge.tests.length}
          refreshKey={attemptsRefreshKey}
        />

        {/* Example solution */}
        {showSolution ? (
          <Card interactive={false} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
                Example solution
              </p>
              <Badge tone="accent">Read-only</Badge>
            </div>
            <div className="overflow-hidden rounded-[18px] bg-[#1D1D1F]">
              <MonacoEditor
                height="360px"
                defaultLanguage="python"
                theme="vs-dark"
                value={challenge.exampleSolution}
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  );
}

function RunnerStatusPill({
  status,
  progress,
}: {
  status: ReturnType<typeof usePyodideRunner>["status"];
  progress: string | null;
}) {
  if (status === "loading") {
    return (
      <span className="text-[12px] text-[var(--ink-muted)]">
        {progress ?? "Loading Pyodide…"}
      </span>
    );
  }
  if (status === "running") {
    return <Badge tone="accent">Running</Badge>;
  }
  if (status === "error") {
    return <Badge tone="danger">Runtime error</Badge>;
  }
  return <Badge tone="success">Ready</Badge>;
}
