import Link from "next/link";

import { SectionHeader } from "@/components/shared/ui";
import { FlashcardReviewClient } from "@/app/review/flashcards/client";
import {
  listAllFlashcards,
  listFlashcardTopics,
  listFlashcardsForTopic,
} from "@/lib/content/flashcard-content";
import { getTopicBySlug } from "@/lib/content/curriculum";

/**
 * Mixed flashcard review. Defaults to every deck (`scope=all`); accepts
 * `?topic=<slug>` to scope the queue to a single deck. Topic filter chips
 * across the top let the learner switch decks without going back to a
 * topic page.
 */
export default async function FlashcardReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const sp = await searchParams;
  const topicSlug = sp.topic;
  const filtered = topicSlug
    ? listFlashcardsForTopic(topicSlug)
    : listAllFlashcards();
  const topic = topicSlug ? await getTopicBySlug(topicSlug) : null;
  const allTopics = listFlashcardTopics();

  // Resolve human-readable names for the filter chips.
  const topicNames = await Promise.all(
    allTopics.map(async (slug) => ({
      slug,
      name: (await getTopicBySlug(slug))?.name ?? slug,
      count: listFlashcardsForTopic(slug).length,
    })),
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Active recall"
        title={
          topic ? `${topic.name} flashcards` : "Flashcards due today"
        }
        description={
          topic
            ? `Drilling only the ${topic.name} deck (${filtered.length} card${filtered.length === 1 ? "" : "s"}). Switch decks below.`
            : "Up to 20 cards across every deck. Flip a card, rate your recall, and the schedule shifts under you."
        }
      />

      {allTopics.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/review/flashcards"
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
              !topicSlug
                ? "bg-[var(--ink)] text-white"
                : "bg-[var(--tile)] text-[var(--ink-muted)] hover:bg-[var(--tile-deep)]"
            }`}
          >
            All decks · {listAllFlashcards().length}
          </Link>
          {topicNames.map((t) => (
            <Link
              key={t.slug}
              href={`/review/flashcards?topic=${t.slug}`}
              className={`rounded-full px-4 py-1.5 text-[13px] font-medium transition ${
                topicSlug === t.slug
                  ? "bg-[var(--ink)] text-white"
                  : "bg-[var(--tile)] text-[var(--ink-muted)] hover:bg-[var(--tile-deep)]"
              }`}
            >
              {t.name} · {t.count}
            </Link>
          ))}
        </div>
      ) : null}

      <FlashcardReviewClient
        allCards={filtered}
        scope={topicSlug ?? "all"}
      />
    </div>
  );
}
