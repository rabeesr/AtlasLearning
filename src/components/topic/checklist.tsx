"use client";

import { useEngagementTracker } from "@/lib/progress/proficiency-tracker";

type ChecklistKind = "objective" | "concept";

export function Checklist({
  topicSlug,
  kind,
  items,
  title,
  eyebrow,
}: {
  topicSlug: string;
  kind: ChecklistKind;
  items: string[];
  title: string;
  eyebrow: string;
}) {
  const tracker = useEngagementTracker();
  const engagement = tracker.getEngagement(topicSlug);
  const checkedSet = new Set(
    kind === "objective" ? engagement.checkedObjectives : engagement.checkedConcepts,
  );

  const toggle = (key: string) => {
    if (kind === "objective") tracker.toggleObjective(topicSlug, key);
    else tracker.toggleConcept(topicSlug, key);
  };

  if (items.length === 0) return null;

  const doneCount = items.filter((i) => checkedSet.has(i)).length;

  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--panel-muted)] p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
          {eyebrow}
        </p>
        <p className="text-[11px] tabular-nums text-[var(--text-muted)]">
          {doneCount} / {items.length}
        </p>
      </div>
      <p className="sr-only">{title}</p>
      <ul className="mt-3 flex flex-col gap-1.5">
        {items.map((item) => {
          const checked = checkedSet.has(item);
          return (
            <li key={item}>
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-white ${
                  checked ? "text-[var(--text-muted)]" : "text-[var(--text)]"
                }`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 flex-none cursor-pointer accent-[var(--ink,#111)]"
                  checked={checked}
                  onChange={() => toggle(item)}
                />
                <span className={`leading-6 ${checked ? "line-through" : ""}`}>{item}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
