import { Card } from "@/components/shared/ui";
import { FlashcardReviewClient } from "@/app/review/flashcards/client";
import { listFlashcardsForTopic } from "@/lib/content/flashcard-content";

/**
 * Per-topic flashcard review page — narrows the deck to a single topic. Uses
 * the same client as the global page so due-card logic and persistence stay
 * in one place.
 */
export default async function TopicFlashcardsPage({
  params,
}: {
  params: Promise<{ topicSlug: string }>;
}) {
  const { topicSlug } = await params;
  const cards = listFlashcardsForTopic(topicSlug);

  if (cards.length === 0) {
    return (
      <Card interactive={false}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          Flashcards
        </p>
        <p className="mt-3 text-[15px] leading-6 text-[var(--ink-muted)]">
          No flashcards have been authored for this topic yet.
        </p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Card interactive={false}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          Flashcards · {cards.length} cards
        </p>
        <p className="mt-3 text-[15px] leading-6 text-[var(--ink-muted)]">
          Active recall — flip a card, then rate yourself. Ratings drive an SM-2-lite schedule:
          easy cards return in months, hard cards return tomorrow.
        </p>
      </Card>
      <FlashcardReviewClient allCards={cards} scope={topicSlug} />
    </div>
  );
}
