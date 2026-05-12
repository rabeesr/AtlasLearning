import { SectionHeader } from "@/components/shared/ui";
import { MixedSessionRunner } from "@/components/review/mixed-session-runner";
import { buildSession, type MixedMode } from "@/lib/reviews/mixed-session";
import { getCurrentUser } from "@/lib/auth/current-user";

export const dynamic = "force-dynamic";

function parseMode(value: string | undefined): MixedMode {
  return value === "refresh" ? "refresh" : "mixed";
}

function parseN(value: string | undefined): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 8;
  return Math.max(1, Math.min(50, Math.round(parsed)));
}

export default async function MixedReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; n?: string }>;
}) {
  const params = await searchParams;
  const mode = parseMode(params.mode);
  const n = parseN(params.n);
  const user = await getCurrentUser();
  const items = await buildSession({ mode, n, userId: user.id });

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow={mode === "refresh" ? "Refresh" : "Mixed practice"}
        title={
          mode === "refresh"
            ? "Refresh what you've already locked in"
            : "Mix it up across topics"
        }
        description={
          mode === "refresh"
            ? "Items pulled from topics at Proficient or Mastered. Failures decrement the topic's proficiency."
            : "Latin-square interleaving across every non-locked topic. No proficiency changes from this session."
        }
      />
      <MixedSessionRunner mode={mode} items={items} />
    </div>
  );
}
