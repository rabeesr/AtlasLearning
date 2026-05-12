import { Button, Card } from "@/components/shared/ui";
import { listAllFlashcards, listFlashcardTopics } from "@/lib/content/flashcard-content";

/**
 * Dashboard CTA for the global flashcard review queue. Shows the total
 * deck size and how many topics have decks authored. The actual due-card
 * count requires a per-user query against `flashcard_reviews`; we keep
 * this card lightweight and let `/review/flashcards` do the scheduling
 * once the user lands there.
 */
export function FlashcardsReviewCard() {
  const total = listAllFlashcards().length;
  const topicCount = listFlashcardTopics().length;

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[#0066CC]">
            Active recall
          </p>
          <h3 className="mt-1 text-[22px] font-semibold leading-tight text-[var(--ink)]">
            Flashcards
          </h3>
        </div>
      </div>
      <p className="text-[15px] leading-6 text-[var(--ink-muted)]">
        Short retrieval prompts you answer from memory. Ratings drive a
        spaced-repetition schedule so the cards that need review come back
        first.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-2xl bg-[var(--tile)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Library
          </p>
          <p className="text-[14px] text-[var(--ink-muted)]">
            {total} card{total === 1 ? "" : "s"} · {topicCount} deck
            {topicCount === 1 ? "" : "s"}
          </p>
          <Button
            href="/review/flashcards"
            variant={total > 0 ? "accent" : "secondary"}
            size="sm"
            className="w-full"
          >
            Review due cards
          </Button>
        </div>
        <div className="flex flex-col gap-2 rounded-2xl bg-[var(--tile)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--ink-muted)]">
            Per topic
          </p>
          <p className="text-[14px] text-[var(--ink-muted)]">
            Practice a single topic at your own pace.
          </p>
          <Button
            href="/topics"
            variant="secondary"
            size="sm"
            className="w-full"
          >
            Browse decks
          </Button>
        </div>
      </div>
    </Card>
  );
}
