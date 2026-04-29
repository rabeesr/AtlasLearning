import { AtlasShell } from "@/components/shared/app-shell";
import { FlagshipDashboard } from "@/components/shared/flagship-surfaces";
import { getLearnerDashboardView } from "@/lib/learner/learner-data";

export default async function HomePage() {
  const { user, curriculum, dashboard } = await getLearnerDashboardView();

  return (
    <AtlasShell
      description="Track what is strong, what needs repair, and which robotics topics remain blocked behind prerequisites. The learner dashboard is now the primary product homepage."
      eyebrow="Learner Dashboard"
      title="Robotics mastery, seen as a curriculum not a feature list."
      aside={
        <div className="rounded-[var(--atlas-radius)] border border-[var(--atlas-border)] bg-[var(--atlas-panel-alt)] p-4">
          <p className="text-[10px] uppercase tracking-[0.32em] text-[var(--atlas-accent-strong)]">
            Learner
          </p>
          <p className="mt-3 font-[var(--atlas-font-display)] text-xl">{user.displayName}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--atlas-text-muted)]">
            {curriculum.topics.length} seeded topics across {dashboard.pillars.length} major robotics pillars.
          </p>
        </div>
      }
    >
      <FlagshipDashboard curriculum={curriculum} dashboard={dashboard} />
    </AtlasShell>
  );
}
