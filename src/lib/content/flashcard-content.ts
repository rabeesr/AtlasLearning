/**
 * Flashcard content loader.
 *
 * Per-topic decks live at `src/data/domains/robotics/flashcards/<slug>/cards.ts`
 * and export `Flashcard[]`. We register decks explicitly here so this file is
 * the canonical source of "which decks exist?" — no webpack-context magic.
 *
 * Adding a new deck: place the file, import it here, append to `DECKS`.
 */

import { cards as linearAlgebraCards } from "@/data/domains/robotics/flashcards/linear-algebra-robotics/cards";
import { cards as calculusCards } from "@/data/domains/robotics/flashcards/calculus-robotics/cards";
import type { Flashcard } from "@/types/practice";

const DECKS: Record<string, Flashcard[]> = {
  "linear-algebra-robotics": linearAlgebraCards,
  "calculus-robotics": calculusCards,
};

export function listFlashcardTopics(): string[] {
  return Object.keys(DECKS);
}

export function listFlashcardsForTopic(topicSlug: string): Flashcard[] {
  return DECKS[topicSlug] ?? [];
}

export function listAllFlashcards(): Flashcard[] {
  return Object.values(DECKS).flat();
}

export function getFlashcardById(id: string): Flashcard | undefined {
  return listAllFlashcards().find((c) => c.id === id);
}
