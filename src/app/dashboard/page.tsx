import { AppShell } from "@/components/shared/app-shell";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCurriculumData } from "@/lib/content/curriculum";
import { mockProgressRepository } from "@/lib/progress/mock-progress-repository";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const curriculum = await getCurriculumData();
  const progress = await mockProgressRepository.listTopicProgress(user.id);

  const broadTopics = curriculum.topics.filter((topic) => topic.parentSlug === null);

  return (
    <AppShell eyebrow="Dashboard" title="User-aware progress scaffold">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {broadTopics.map((topic) => {
          const children = curriculum.topics.filter((child) => child.parentSlug === topic.slug);
          const activeChildren = children.filter((child) =>
            progress.some((entry) => entry.topicSlug === child.slug),
          ).length;

          return (
            <section
              className="rounded-[1.75rem] border border-[var(--card-border)] bg-[var(--card)] p-5 shadow-[var(--shadow)]"
              key={topic.slug}
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">{topic.difficulty}</p>
              <h2 className="mt-2 text-2xl font-semibold">{topic.name}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{topic.description}</p>
              <div className="mt-5 rounded-2xl bg-white/70 p-4">
                <p className="text-sm font-medium">{activeChildren} seeded subtopics touched</p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Future Supabase-backed progress will aggregate per-user attempts and review state
                  here. The page already scopes everything through the current user abstraction.
                </p>
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
