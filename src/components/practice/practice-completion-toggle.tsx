"use client";

import { useEngagementTracker } from "@/lib/progress/proficiency-tracker";

export function PracticeCompletionToggle({
  topicSlug,
  itemSlug,
  kind,
}: {
  topicSlug: string;
  itemSlug: string;
  kind: "challenge" | "project";
}) {
  const tracker = useEngagementTracker();
  const engagement = tracker.getEngagement(topicSlug);
  const completed =
    kind === "challenge"
      ? engagement.completedChallenges.includes(itemSlug)
      : engagement.completedProjects.includes(itemSlug);

  const onToggle = () => {
    if (kind === "challenge") tracker.toggleChallenge(topicSlug, itemSlug);
    else tracker.toggleProject(topicSlug, itemSlug);
  };

  return (
    <label
      className={`mt-2 inline-flex cursor-pointer items-center gap-2 self-start rounded-full px-3 py-1.5 text-[12px] font-medium transition-colors ${
        completed
          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          : "bg-[var(--tile)] text-[var(--text-muted)] hover:bg-[var(--tile-deep)]"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <input
        type="checkbox"
        className="h-3.5 w-3.5 cursor-pointer accent-emerald-600"
        checked={completed}
        onChange={onToggle}
      />
      {completed ? "Completed" : "Mark complete"}
    </label>
  );
}
