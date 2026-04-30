import { PracticeCard } from "@/components/practice/practice-card";
import { PracticeFilters } from "@/components/practice/practice-filters";
import { SectionHeader } from "@/components/shared/ui";
import { getCurriculumData } from "@/lib/content/curriculum";
import { filterPractice, listPracticeItems } from "@/lib/practice/practice-repository";
import type { Difficulty, PracticeKind } from "@/types/domain";

function readArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") return [value];
  return [];
}

export async function GlobalPracticePage({
  kind,
  searchParams,
  title,
  eyebrow,
  description,
}: {
  kind: PracticeKind;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
  title: string;
  eyebrow: string;
  description: string;
}) {
  const [curriculum, params] = await Promise.all([getCurriculumData(), searchParams]);
  const all = listPracticeItems(kind);

  const selectedTopics = readArray(params.topic);
  const selectedPhases = readArray(params.phase);
  const selectedDifficulties = readArray(params.difficulty) as Difficulty[];

  // Expand phase selection into topic slugs (any topic in those phases).
  const phaseExpandedTopics = selectedPhases.flatMap((phaseSlug) =>
    curriculum.topics.filter((t) => t.phaseSlug === phaseSlug).map((t) => t.slug),
  );

  const topicSlugFilter =
    selectedTopics.length > 0 || phaseExpandedTopics.length > 0
      ? Array.from(new Set([...selectedTopics, ...phaseExpandedTopics]))
      : undefined;

  const filtered = filterPractice(all, {
    topics: topicSlugFilter,
    difficulties: selectedDifficulties.length > 0 ? selectedDifficulties : undefined,
  });

  // Per-topic counts (across the unfiltered pool) for the filter UI.
  const topicCounts: Record<string, number> = {};
  for (const item of all) {
    const seenTops = new Set<string>();
    for (const slug of item.topicSlugs) {
      const topic = curriculum.topics.find((t) => t.slug === slug);
      const top = topic?.parentSlug ? topic.parentSlug : topic?.slug;
      if (top && !seenTops.has(top)) {
        seenTops.add(top);
        topicCounts[top] = (topicCounts[top] ?? 0) + 1;
      }
    }
  }

  const topicLookup = new Map(curriculum.topics.map((t) => [t.slug, t]));

  return (
    <div className="space-y-6">
      <SectionHeader eyebrow={eyebrow} title={title} description={description} />
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <PracticeFilters curriculum={curriculum} topicCounts={topicCounts} />
        <div className="space-y-3">
          <p className="text-xs text-[var(--text-muted)]">
            {filtered.length} of {all.length} {kind === "challenge" ? "challenges" : `${kind}s`}
          </p>
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border)] p-10 text-center text-sm text-[var(--text-muted)]">
              No items match the current filters.
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
              {filtered.map((item) => (
                <PracticeCard key={item.slug} item={item} topicLookup={topicLookup} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
