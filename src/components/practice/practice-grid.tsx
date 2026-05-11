"use client";

import { PracticeCard } from "@/components/practice/practice-card";
import { useSolvedChallenges } from "@/components/practice/use-solved-challenges";
import type { CurriculumTopic, PracticeItem } from "@/types/domain";

/**
 * Client-side grid wrapper. Same layout as before but fetches the signed-in
 * user's solved-challenge slugs and threads a `solved` flag into each card.
 * For anonymous users no request is made and no badges are rendered.
 */
export function PracticeGrid({
  items,
  topicLookup,
}: {
  items: PracticeItem[];
  // Map is not serializable across the client boundary, so we pass an array
  // of [slug, topic] pairs and rebuild it on the client.
  topicLookup: Array<[string, CurriculumTopic]>;
}) {
  const lookup = new Map(topicLookup);
  const { solved, isSignedIn } = useSolvedChallenges();

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
      {items.map((item) => (
        <PracticeCard
          key={item.slug}
          item={item}
          topicLookup={lookup}
          solved={
            isSignedIn && item.kind === "challenge" && solved.has(item.slug)
          }
        />
      ))}
    </div>
  );
}
