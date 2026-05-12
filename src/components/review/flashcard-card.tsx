"use client";

import "katex/dist/katex.min.css";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

import { Card } from "@/components/shared/ui";
import type { Flashcard } from "@/types/practice";

/**
 * FlashcardFlipCard — visual flip card.
 *
 * Renders a single card with a click-to-flip surface. KaTeX is enabled via
 * remark-math + rehype-katex; we add the stylesheet here so the standalone
 * flashcard page picks it up regardless of which other pages preloaded it.
 *
 * Apple aesthetic: borderless rounded card, soft shadow on hover, no harsh
 * borders. Flip uses a 3D rotateY with `preserve-3d` so the back hides cleanly.
 */
export function FlashcardFlipCard({
  card,
  flipped,
  onFlip,
}: {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <div
      className="flashcard-flip-shell"
      style={{ perspective: "1400px" }}
    >
      <button
        type="button"
        onClick={onFlip}
        aria-pressed={flipped}
        aria-label={flipped ? "Show front" : "Show back"}
        className="relative block w-full text-left focus:outline-none"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 480ms cubic-bezier(0.22, 0.61, 0.36, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "320px",
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Card interactive={false} className="flex h-full flex-col gap-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
              Recall
            </p>
            <div className="flashcard-prose flex-1 text-[18px] leading-[1.65] text-[var(--ink)]">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {card.front}
              </ReactMarkdown>
            </div>
            <p className="text-[13px] text-[var(--ink-faint)]">
              Tap to flip · then rate yourself below
            </p>
          </Card>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card interactive={false} className="flex h-full flex-col gap-4">
            <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
              Answer
            </p>
            <div className="flashcard-prose flex-1 overflow-auto text-[16px] leading-[1.65] text-[var(--ink)]">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {card.back}
              </ReactMarkdown>
              {card.formula ? (
                <div className="mt-4 rounded-[14px] bg-[var(--tile-deep)] px-4 py-3">
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {`$$${card.formula}$$`}
                  </ReactMarkdown>
                </div>
              ) : null}
              {card.mnemonic ? (
                <p className="mt-3 text-[13px] italic text-[var(--ink-muted)]">
                  Mnemonic: {card.mnemonic}
                </p>
              ) : null}
            </div>
          </Card>
        </div>
      </button>
    </div>
  );
}
