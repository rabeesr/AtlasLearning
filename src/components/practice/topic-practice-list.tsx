import { PracticeCard } from "@/components/practice/practice-card";
import type { CurriculumTopic, PracticeItem } from "@/types/domain";

export function TopicPracticeList({
  items,
  topicLookup,
  emptyMessage,
}: {
  items: PracticeItem[];
  topicLookup: Map<string, CurriculumTopic>;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <PracticeCard key={item.slug} item={item} topicLookup={topicLookup} />
      ))}
    </div>
  );
}
