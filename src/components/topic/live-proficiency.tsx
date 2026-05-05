"use client";

import { useMemo } from "react";

import { ProgressBar } from "@/components/shared/ui";
import { useQuizTracker } from "@/lib/practice/quiz-tracker";
import { useEngagementTracker } from "@/lib/progress/proficiency-tracker";
import { computeProficiency } from "@/lib/progress/proficiency-calculator";
import type { ProficiencyComponent } from "@/types/proficiency";

export interface LiveProficiencyProps {
  topicSlug: string;
  totalObjectives: number;
  totalConcepts: number;
  totalChallenges: number;
  totalProjects: number;
  quizTotal: number;
}

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

function toneFor(score: number): "accent" | "success" | "warning" | "danger" {
  if (score >= 85) return "success";
  if (score >= 60) return "accent";
  if (score >= 40) return "warning";
  return "danger";
}

const COMPONENT_ORDER: ProficiencyComponent[] = ["learn", "quiz", "challenges", "projects"];

export function LiveProficiencyHeader(props: LiveProficiencyProps) {
  const { score } = useLiveProficiency(props);
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--text-muted)]">
        Proficiency
      </p>
      <p className="mt-1 text-3xl font-semibold tabular-nums text-[var(--text)]">{score}%</p>
      <ProgressBar value={score} tone={toneFor(score)} className="mt-2" />
      <p className="mt-2 text-[11px] text-[var(--text-muted)]">Live · in-session</p>
    </>
  );
}

export function LiveProficiencyBreakdown(props: LiveProficiencyProps) {
  const { score, components } = useLiveProficiency(props);

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
          Live proficiency
        </p>
        <p className="text-2xl font-semibold tabular-nums text-[var(--text)]">{score}%</p>
      </div>
      <ProgressBar value={score} tone={toneFor(score)} className="mt-2" />
      <ul className="mt-4 flex flex-col gap-2">
        {COMPONENT_ORDER.map((key) => {
          const c = components[key];
          const dim = !c.available;
          return (
            <li
              key={key}
              className={`flex items-center justify-between gap-3 rounded-md px-2 py-1.5 text-[13px] ${
                dim ? "text-[var(--text-muted)]" : "text-[var(--text)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium">{c.label}</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  weight {Math.round(c.weight * 100)}%
                </span>
              </div>
              <div className="flex items-center gap-3 tabular-nums">
                {c.available ? (
                  <>
                    <span>{pct(c.ratio)}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">
                      {key === "quiz"
                        ? `${c.numerator.toFixed(1)} / ${c.denominator}`
                        : `${c.numerator} / ${c.denominator}`}
                    </span>
                  </>
                ) : (
                  <span className="text-[11px] uppercase tracking-wider">
                    {key === "quiz" ? "no attempt" : "none authored"}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 text-[11px] leading-5 text-[var(--text-muted)]">
        Mastery blends reading (objectives + concepts), quiz performance, and built work.
        Component weights renormalize when a surface has no items yet.
      </p>
    </div>
  );
}

function useLiveProficiency(props: LiveProficiencyProps) {
  const engagement = useEngagementTracker().getEngagement(props.topicSlug);
  const quizAttempt = useQuizTracker().getCurrentAttempt(props.topicSlug);

  return useMemo(() => {
    const quizCounts = quizAttempt
      ? quizAttempt.attempts.reduce(
          (acc, a) => {
            if (a.result === "correct") acc.correct += 1;
            else if (a.result === "partial") acc.partial += 1;
            return acc;
          },
          { correct: 0, partial: 0 },
        )
      : null;

    return computeProficiency({
      totalObjectives: props.totalObjectives,
      checkedObjectives: engagement.checkedObjectives.length,
      totalConcepts: props.totalConcepts,
      checkedConcepts: engagement.checkedConcepts.length,
      totalChallenges: props.totalChallenges,
      completedChallenges: engagement.completedChallenges.length,
      totalProjects: props.totalProjects,
      completedProjects: engagement.completedProjects.length,
      quiz:
        quizAttempt && props.quizTotal > 0
          ? { total: props.quizTotal, correct: quizCounts!.correct, partial: quizCounts!.partial }
          : null,
    });
  }, [
    props.totalObjectives,
    props.totalConcepts,
    props.totalChallenges,
    props.totalProjects,
    props.quizTotal,
    engagement.checkedObjectives.length,
    engagement.checkedConcepts.length,
    engagement.completedChallenges.length,
    engagement.completedProjects.length,
    quizAttempt,
  ]);
}
