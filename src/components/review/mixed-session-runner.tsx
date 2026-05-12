"use client";

import { useMemo, useState } from "react";

import { ChallengeRunner } from "@/components/practice/challenge-runner";
import { QuizPlayer } from "@/components/practice/quiz-player";
import { Badge, Button, Card, SectionHeader } from "@/components/shared/ui";
import { useReflection } from "@/components/learn/reflection-context";
import { applyDemotionAction } from "@/app/review/mixed/actions";
import type { QuestionResult } from "@/types/practice";

// Serializable mirror of `SessionItem` from `mixed-session.ts` — the page
// builds them server-side and hands them down.
export interface SerializedQuizItem {
  kind: "quiz";
  topicSlug: string;
  topicTitle: string;
  itemSlug: string;
  // Re-using the QuizQuestion type; structurally JSON-serializable.
  question: import("@/types/practice").QuizQuestion;
}
export interface SerializedChallengeItem {
  kind: "challenge";
  topicSlug: string;
  topicTitle: string;
  itemSlug: string;
  challenge: import("@/types/practice").CodingChallenge;
}
export type SerializedSessionItem = SerializedQuizItem | SerializedChallengeItem;

interface RunnerProps {
  mode: "refresh" | "mixed";
  items: SerializedSessionItem[];
}

interface PerItemOutcome {
  topicSlug: string;
  kind: "quiz" | "challenge";
  passed: boolean;
}

// Per-topic demotion delta in Refresh mode: scaled by # failures.
const DEMOTION_PER_FAIL = -5;

export function MixedSessionRunner({ mode, items }: RunnerProps) {
  const { trigger } = useReflection();
  const [index, setIndex] = useState(0);
  const [outcomes, setOutcomes] = useState<PerItemOutcome[]>([]);
  const [done, setDone] = useState(false);

  const total = items.length;
  const current = items[index];

  const advance = (passed: boolean) => {
    if (!current) return;
    setOutcomes((prev) => [
      ...prev,
      { topicSlug: current.topicSlug, kind: current.kind, passed },
    ]);
    if (index + 1 >= total) {
      void finishSession([
        ...outcomes,
        { topicSlug: current.topicSlug, kind: current.kind, passed },
      ]);
    } else {
      setIndex((i) => i + 1);
    }
  };

  const finishSession = async (final: PerItemOutcome[]) => {
    if (mode === "refresh") {
      const failsByTopic = new Map<string, number>();
      for (const o of final) {
        if (!o.passed) failsByTopic.set(o.topicSlug, (failsByTopic.get(o.topicSlug) ?? 0) + 1);
      }
      await Promise.all(
        Array.from(failsByTopic.entries()).map(([slug, fails]) =>
          applyDemotionAction(slug, fails * DEMOTION_PER_FAIL),
        ),
      );
    }
    setDone(true);
    trigger({ kind: "mixed-session" });
  };

  if (total === 0) {
    return (
      <Card interactive={false} className="flex flex-col gap-3">
        <p className="text-[15px] text-[var(--ink-muted)]">
          No items are available for this session. Try the {mode === "refresh" ? "Mixed" : "Refresh"} mode, or work through a couple of topics first.
        </p>
        <Button href="/dashboard" variant="secondary">
          Back to dashboard
        </Button>
      </Card>
    );
  }

  if (done) {
    return <SessionSummary mode={mode} items={items} outcomes={outcomes} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--ink-muted)]">
          <Badge tone="accent">
            {mode === "refresh" ? "Refresh" : "Mixed practice"}
          </Badge>
          <span>
            Item {index + 1} of {total}
          </span>
          <span>·</span>
          <span>{current.topicTitle}</span>
        </div>
        <span className="text-[12px] uppercase tracking-[0.28em] text-[var(--ink-faint)]">
          {current.kind}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--tile)]">
        <div
          className="h-full rounded-full bg-[#0066CC] transition-all duration-300"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
      {current.kind === "quiz" ? (
        <QuizPlayer
          key={`${current.topicSlug}:${current.itemSlug}`}
          quiz={{ topicSlug: current.topicSlug, items: [current.question] }}
          topicTitle={current.topicTitle}
          mode="session"
          onSessionItemComplete={(result: QuestionResult) =>
            advance(result === "correct" || result === "partial")
          }
        />
      ) : (
        <ChallengeRunner
          key={`${current.topicSlug}:${current.itemSlug}`}
          challenge={current.challenge}
          mode="session"
          onSessionComplete={advance}
        />
      )}
      {current.kind === "challenge" ? (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={() => advance(false)}>
            Skip / give up
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function SessionSummary({
  mode,
  items,
  outcomes,
}: {
  mode: "refresh" | "mixed";
  items: SerializedSessionItem[];
  outcomes: PerItemOutcome[];
}) {
  const perTopic = useMemo(() => {
    const map = new Map<string, { title: string; passed: number; total: number }>();
    for (const o of outcomes) {
      const meta = items.find((i) => i.topicSlug === o.topicSlug);
      const entry = map.get(o.topicSlug) ?? {
        title: meta?.topicTitle ?? o.topicSlug,
        passed: 0,
        total: 0,
      };
      entry.total += 1;
      if (o.passed) entry.passed += 1;
      map.set(o.topicSlug, entry);
    }
    return Array.from(map.entries()).map(([slug, v]) => ({ slug, ...v }));
  }, [items, outcomes]);

  const totalPassed = outcomes.filter((o) => o.passed).length;
  const pct = outcomes.length > 0 ? Math.round((totalPassed / outcomes.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <SectionHeader
        eyebrow={mode === "refresh" ? "Refresh complete" : "Mixed practice complete"}
        title={`${pct}% on this session`}
        description={
          mode === "refresh"
            ? "Refresh-mode failures deducted from the matching topic's proficiency."
            : "Mixed practice — no proficiency changes from this session."
        }
      />
      <Card interactive={false} className="flex flex-col gap-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          Per topic
        </p>
        <ul className="flex flex-col gap-2">
          {perTopic.map((t) => (
            <li
              key={t.slug}
              className="flex items-center justify-between rounded-2xl bg-[var(--tile)] px-4 py-3 text-[14px]"
            >
              <span className="text-[var(--ink)]">{t.title}</span>
              <span className="tabular-nums text-[var(--ink-muted)]">
                {t.passed} / {t.total} passed
              </span>
            </li>
          ))}
        </ul>
      </Card>
      <div className="flex gap-3">
        <Button href="/dashboard">Back to dashboard</Button>
        <Button href={`/review/mixed?mode=${mode}&n=${items.length}`} variant="secondary">
          Run another
        </Button>
      </div>
    </div>
  );
}
