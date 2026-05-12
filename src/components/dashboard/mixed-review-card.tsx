import { Badge, Button, Card } from "@/components/shared/ui";
import { previewSessionCounts } from "@/lib/reviews/mixed-session";

/**
 * Dashboard CTA for Mixed Review. Surfaces the two modes with item counts
 * pulled from the current learner's eligible topics. Server component —
 * runs the cheap preview at request time.
 */
export async function MixedReviewCard() {
  const counts = await previewSessionCounts();
  const refreshN = Math.min(8, Math.max(2, counts.refresh.totalItemsAvailable));
  const mixedN = Math.min(10, Math.max(2, counts.mixed.totalItemsAvailable));

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[#0066CC]">
            Interleaved practice
          </p>
          <h3 className="mt-1 text-[22px] font-semibold leading-tight text-[var(--ink)]">
            Mixed review
          </h3>
        </div>
        <Badge tone="accent">Khan-style</Badge>
      </div>
      <p className="text-[15px] leading-6 text-[var(--ink-muted)]">
        Interleaved quizzes and coding challenges. Refresh keeps your proficient topics sharp; Mixed practice ranges across every non-locked topic.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-2xl bg-[var(--tile)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Refresh
          </p>
          <p className="text-[14px] text-[var(--ink-muted)]">
            {counts.refresh.refreshEligibleTopics} proficient topic{counts.refresh.refreshEligibleTopics === 1 ? "" : "s"} ·{" "}
            {counts.refresh.totalItemsAvailable} items available
          </p>
          <Button
            href={`/review/mixed?mode=refresh&n=${refreshN}`}
            variant={counts.refresh.totalItemsAvailable > 0 ? "primary" : "secondary"}
            size="sm"
          >
            Start Refresh
          </Button>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-[var(--tile)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Mixed practice
          </p>
          <p className="text-[14px] text-[var(--ink-muted)]">
            {counts.mixed.mixedEligibleTopics} topic{counts.mixed.mixedEligibleTopics === 1 ? "" : "s"} ·{" "}
            {counts.mixed.totalItemsAvailable} items available
          </p>
          <Button
            href={`/review/mixed?mode=mixed&n=${mixedN}`}
            variant={counts.mixed.totalItemsAvailable > 0 ? "primary" : "secondary"}
            size="sm"
          >
            Start Mixed
          </Button>
        </div>
      </div>
    </Card>
  );
}
