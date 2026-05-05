"use client";

import type { Route } from "next";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useMemo, useTransition } from "react";

import type { CurriculumData, Difficulty } from "@/types/domain";

const DIFFICULTIES: Difficulty[] = ["beginner", "intermediate", "advanced"];

interface ActiveFilter {
  group: "phase" | "difficulty" | "topic";
  value: string;
  label: string;
}

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

  const phaseLookup = useMemo(
    () => new Map(curriculum.phases.map((p) => [p.slug, p])),
    [curriculum.phases],
  );
  const topicLookup = useMemo(
    () => new Map(curriculum.topics.map((t) => [t.slug, t])),
    [curriculum.topics],
  );

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

  function removeOne(group: ActiveFilter["group"], value: string) {
    update((p) => {
      const remaining = p.getAll(group).filter((v) => v !== value);
      p.delete(group);
      for (const v of remaining) p.append(group, v);
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
  const totalSelected = selectedTopics.size + selectedPhases.size + selectedDiffs.size;
  const hasAnySelected = totalSelected > 0;

  const activeFilters: ActiveFilter[] = useMemo(() => {
    const result: ActiveFilter[] = [];
    for (const slug of selectedPhases) {
      result.push({
        group: "phase",
        value: slug,
        label: phaseLookup.get(slug)?.name.replace(/^Phase \d+ — /, "P") ?? slug,
      });
    }
    for (const diff of selectedDiffs) {
      result.push({ group: "difficulty", value: diff, label: capitalize(diff) });
    }
    for (const slug of selectedTopics) {
      result.push({
        group: "topic",
        value: slug,
        label: topicLookup.get(slug)?.name ?? slug,
      });
    }
    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, phaseLookup, topicLookup]);

  return (
    <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--panel)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
          Filters
          {totalSelected > 0 ? (
            <span className="rounded-full bg-[var(--ink)] px-2 py-0.5 text-[10px] font-semibold tracking-normal text-white">
              {totalSelected}
            </span>
          ) : null}
          {isPending ? <span className="text-[var(--text-muted)]">…</span> : null}
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

      {/* Active-filter summary — shows exactly what is currently applied. */}
      {activeFilters.length > 0 ? (
        <div className="rounded-lg bg-[var(--tile)] p-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.20em] text-[var(--text-muted)]">
            Currently filtering by
          </p>
          <div className="flex flex-wrap gap-1.5">
            {activeFilters.map((f) => (
              <button
                key={`${f.group}:${f.value}`}
                onClick={() => removeOne(f.group, f.value)}
                title={`Remove ${f.label} filter`}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--ink)] px-3 py-1 text-[11px] font-medium text-white transition-colors hover:bg-black"
              >
                <span>{f.label}</span>
                <span aria-hidden className="text-[14px] leading-none">×</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-[12px] text-[var(--text-muted)]">
          Showing all items. Click any chip below to filter.
        </p>
      )}

      <FilterGroup label="Phase">
        {curriculum.phases.map((phase) => {
          const active = selectedPhases.has(phase.slug);
          return (
            <FilterChip
              key={phase.slug}
              active={active}
              onClick={() => toggle("phase", phase.slug, selectedPhases)}
              title={active ? `Active: ${phase.name}` : `Filter by ${phase.name}`}
            >
              {phase.name.replace(/^Phase \d+ — /, "P")}
            </FilterChip>
          );
        })}
      </FilterGroup>

      <FilterGroup label="Difficulty">
        {DIFFICULTIES.map((diff) => {
          const active = selectedDiffs.has(diff);
          return (
            <FilterChip
              key={diff}
              active={active}
              onClick={() => toggle("difficulty", diff, selectedDiffs)}
              title={active ? `Active: ${capitalize(diff)}` : `Filter by ${capitalize(diff)}`}
            >
              <span className="capitalize">{diff}</span>
            </FilterChip>
          );
        })}
      </FilterGroup>

      <FilterGroup
        label={`Topics${selectedTopics.size > 0 ? ` (${selectedTopics.size})` : ""}`}
      >
        <div className="flex max-h-72 flex-wrap gap-1.5 overflow-y-auto pr-1">
          {topLevelTopics.map((topic) => {
            const active = selectedTopics.has(topic.slug);
            const count = topicCounts[topic.slug] ?? 0;
            return (
              <FilterChip
                key={topic.slug}
                active={active}
                disabled={count === 0 && !active}
                onClick={() => toggle("topic", topic.slug, selectedTopics)}
                title={
                  count === 0 && !active
                    ? `No items match ${topic.name}`
                    : active
                      ? `Active: ${topic.name}`
                      : `Filter by ${topic.name}`
                }
              >
                <span>{topic.name}</span>
                <span
                  className={`ml-1 text-[10px] tabular-nums ${
                    active ? "text-white/80" : "text-[var(--text-muted)]"
                  }`}
                >
                  {count}
                </span>
              </FilterChip>
            );
          })}
        </div>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-[var(--text)]">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterChip({
  active,
  disabled = false,
  onClick,
  title,
  children,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs transition-colors";
  const classes = active
    ? "bg-[var(--ink)] text-white hover:bg-black"
    : disabled
      ? "border border-[var(--border)] text-[var(--text-muted)] opacity-50 cursor-not-allowed"
      : "border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--ink)] hover:text-[var(--text)]";
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      aria-pressed={active}
      className={`${base} ${classes}`}
    >
      {active ? (
        <svg
          aria-hidden
          viewBox="0 0 12 12"
          className="mr-1 h-3 w-3"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
