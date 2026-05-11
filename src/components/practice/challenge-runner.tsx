"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

import { Badge, Button, Card } from "@/components/shared/ui";
import { TopicMarkdown } from "@/components/topic/topic-markdown";
import { useChallengeTracker } from "@/lib/practice/challenge-tracker";
import { usePyodideRunner } from "@/lib/pyodide/use-pyodide-runner";
import type {
  CodingChallenge,
  ChallengeTestResult,
} from "@/types/practice";

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

  const onRun = async () => {
    const outcome = await runner.run(code, challenge.tests, challenge.pythonPackages);
    if (outcome && attemptId) {
      setHasSubmitted(true);
      await tracker.recordRun(attemptId, outcome.results, code);
    }
  };

  const onReveal = async () => {
    setShowSolution(true);
    if (attemptId) await tracker.markRevealed(attemptId);
  };

  const onGiveUp = () => setGaveUp(true);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      {/* LEFT — Problem */}
      <Card interactive={false}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          Problem
        </p>
        <div className="mt-4">
          <TopicMarkdown content={challenge.problemMarkdown} />
        </div>
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
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={onRun}
                variant="primary"
                className={
                  runner.status === "ready" || runner.status === "running"
                    ? ""
                    : "pointer-events-none opacity-50"
                }
              >
                {runner.status === "running" ? "Running…" : "Run code"}
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
            {runner.lastResults ? (
              <Badge tone={passed === runner.lastResults.length ? "success" : "neutral"}>
                {passed} / {runner.lastResults.length} passing
              </Badge>
            ) : null}
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
              return <TestRow key={t.name} name={t.name} result={result} />;
            })}
          </ul>
        </Card>

        {/* Console / errors */}
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
          <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--ink-faint)]">
            stdout
          </p>
          <pre className="mt-2 max-h-[260px] overflow-auto whitespace-pre-wrap rounded-[14px] bg-[var(--tile-deep)] px-4 py-3 font-mono text-[13px] leading-6 text-[var(--ink-muted)]">
            {runner.stdout || "(run code to see output)"}
          </pre>
        </Card>

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

function TestRow({
  name,
  result,
}: {
  name: string;
  result?: ChallengeTestResult;
}) {
  let dotClass = "border border-[var(--ink-faint)]";
  if (result?.passed) {
    dotClass = "bg-[var(--success)]";
  } else if (result && !result.passed) {
    dotClass = "bg-[var(--danger)]";
  }
  return (
    <li className="flex flex-col gap-1.5 rounded-[14px] bg-white px-4 py-3">
      <div className="flex items-center gap-3 font-mono text-[14px] text-[var(--ink)]">
        <span
          aria-hidden
          className={`inline-flex h-3.5 w-3.5 flex-none rounded-full ${dotClass}`}
        />
        {name}
      </div>
      {result?.errorMessage ? (
        <pre className="ml-6 whitespace-pre-wrap font-mono text-[12px] leading-5 text-[var(--danger)]">
          {result.errorMessage}
        </pre>
      ) : null}
    </li>
  );
}
