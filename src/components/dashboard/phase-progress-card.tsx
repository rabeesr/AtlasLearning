import Link from "next/link";

import { Badge, Card, ProgressBar } from "@/components/shared/ui";
import type { PhaseProgress } from "@/types/learner";

export function PhaseProgressCard({ progress }: { progress: PhaseProgress }) {
  const { phase, topicCount, completedCount, decayingCount, blockedCount, averageProficiency } =
    progress;
  const tone =
    averageProficiency >= 75
      ? "success"
      : averageProficiency >= 45
        ? "accent"
        : averageProficiency >= 20
          ? "warning"
          : "danger";

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
            {phase.name}
          </p>
          <p className="mt-2 text-[16px] leading-[1.55] text-[var(--text-muted)]">{phase.description}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold text-[var(--text)] tabular-nums">{averageProficiency}%</p>
          <p className="text-[12px] uppercase tracking-wider text-[var(--text-muted)]">avg proficiency</p>
        </div>
      </div>
      <ProgressBar value={averageProficiency} tone={tone} />
      <div className="flex flex-wrap gap-2 text-[14px] text-[var(--text-muted)]">
        <Badge>
          {completedCount}/{topicCount} strong
        </Badge>
        {decayingCount > 0 ? <Badge tone="danger">{decayingCount} decaying</Badge> : null}
        {blockedCount > 0 ? <Badge tone="warning">{blockedCount} blocked</Badge> : null}
      </div>
      <div className="mt-1 flex flex-wrap gap-2">
        {progress.topicSlugs.map((slug) => (
          <Link
            key={slug}
            href={`/topics/${slug}`}
            className="rounded-full border border-[var(--accent)]/40 bg-transparent px-3 py-1 text-[14px] capitalize text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {slug.replace(/-/g, " ")}
          </Link>
        ))}
      </div>
    </Card>
  );
}
