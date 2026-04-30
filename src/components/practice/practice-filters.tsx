"use client";

import type { Route } from "next";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

import type { CurriculumData, Difficulty } from "@/types/domain";

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

export function PracticeFilters({
  curriculum,
  topicCounts,
}: {
  curriculum: CurriculumData;
  topicCounts: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const selectedTopics = new Set(params.getAll("topic"));
  const selectedPhases = new Set(params.getAll("phase"));
  const selectedDiffs = new Set(params.getAll("difficulty"));

  function update(mut: (current: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mut(next);
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}` as Route, { scroll: false });
    });
  }

  function toggle(key: string, value: string, current: Set<string>) {
    update((p) => {
      p.delete(key);
      const updated = new Set(current);
      if (updated.has(value)) updated.delete(value);
      else updated.add(value);
      for (const v of updated) p.append(key, v);
    });
  }

  function clearAll() {
    update((p) => {
      p.delete("topic");
      p.delete("phase");
      p.delete("difficulty");
    });
  }

  const topLevelTopics = curriculum.topics.filter((t) => t.parentSlug === null);
  const hasAnySelected =
    selectedTopics.size > 0 || selectedPhases.size > 0 || selectedDiffs.size > 0;

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
          Filters {isPending ? <span className="ml-2 text-[var(--text-muted)]">…</span> : null}
        </p>
        {hasAnySelected ? (
          <button
            onClick={clearAll}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-[var(--text)]">Phase</p>
        <div className="flex flex-wrap gap-1.5">
          {curriculum.phases.map((phase) => {
            const active = selectedPhases.has(phase.slug);
            return (
              <button
                key={phase.slug}
                onClick={() => toggle("phase", phase.slug, selectedPhases)}
                className={`rounded-md border px-2 py-1 text-xs transition ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                }`}
              >
                {phase.name.replace(/^Phase \d+ — /, "P")}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-[var(--text)]">Difficulty</p>
        <div className="flex flex-wrap gap-1.5">
          {DIFFICULTIES.map((diff) => {
            const active = selectedDiffs.has(diff);
            return (
              <button
                key={diff}
                onClick={() => toggle("difficulty", diff, selectedDiffs)}
                className={`rounded-md border px-2 py-1 text-xs capitalize transition ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                }`}
              >
                {diff}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-[var(--text)]">
          Topics{" "}
          {selectedTopics.size > 0 ? (
            <span className="text-[var(--text-muted)]">({selectedTopics.size} selected)</span>
          ) : null}
        </p>
        <div className="flex max-h-72 flex-wrap gap-1.5 overflow-y-auto pr-1">
          {topLevelTopics.map((topic) => {
            const active = selectedTopics.has(topic.slug);
            const count = topicCounts[topic.slug] ?? 0;
            return (
              <button
                key={topic.slug}
                onClick={() => toggle("topic", topic.slug, selectedTopics)}
                className={`rounded-md border px-2 py-1 text-xs transition ${
                  active
                    ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
                } ${count === 0 ? "opacity-50" : ""}`}
              >
                {topic.name}
                <span className="ml-1.5 text-[10px] opacity-70">{count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
