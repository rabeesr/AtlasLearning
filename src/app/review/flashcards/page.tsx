import { SectionHeader } from "@/components/shared/ui";
import { FlashcardReviewClient } from "@/app/review/flashcards/client";
import { listAllFlashcards } from "@/lib/content/flashcard-content";

/**
 * Mixed flashcard review across all decks. Up to 20 due cards are picked
 * client-side once we know the user's review history; if nothing is due, the
 * fallback is "everything", capped at 20. Per the spec.
 */
export default function FlashcardReviewPage() {
  const cards = listAllFlashcards();
  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Active recall"
        title="Flashcards due today"
        description="Up to 20 cards across every deck. Flip a card, rate your recall, and the schedule shifts under you."
      />
      <FlashcardReviewClient allCards={cards} scope="all" />
    </div>
  );
}
