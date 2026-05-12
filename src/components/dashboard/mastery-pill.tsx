import type { MasteryLevel } from "@/lib/progress/proficiency-calculator";
import { MASTERY_LABEL } from "@/lib/progress/proficiency-calculator";

/**
 * MasteryPill — Apple-aesthetic pill for the discrete mastery level
 * derived from `proficiency_score`. Borderless except the "mastered"
 * ring; soft tonal fills throughout.
 */
export function MasteryPill({ level }: { level: MasteryLevel }) {
  const styles: Record<MasteryLevel, string> = {
    locked:
      "bg-[var(--tile)] text-[var(--ink-faint)]",
    attempted:
      "bg-[var(--tile)] text-[var(--ink-muted)]",
    familiar:
      "bg-[color-mix(in_srgb,#0066CC_10%,transparent)] text-[#0066CC]",
    proficient:
      "bg-[#0066CC] text-white",
    mastered:
      "bg-white text-[#0066CC] ring-2 ring-[#0066CC]",
  };
  const dot: Record<MasteryLevel, string> = {
    locked: "bg-[var(--ink-faint)]",
    attempted: "bg-[var(--ink-muted)]",
    familiar: "bg-[#0066CC]/60",
    proficient: "bg-white",
    mastered: "bg-[#0066CC]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium tracking-[0.01em] ${styles[level]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot[level]}`} />
      {MASTERY_LABEL[level]}
    </span>
  );
}
