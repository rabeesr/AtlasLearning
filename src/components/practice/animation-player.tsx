"use client";

import { useEffect, useRef, useState } from "react";

import { Button, Card } from "@/components/shared/ui";

/**
 * BETA 4.2 — AnimationPlayer.
 *
 * Plays a sequence of base64 PNG frames produced by the Pyodide worker's
 * FuncAnimation capture. Renders the current frame inside a rounded card with
 * play/pause, scrubber, frame counter, and fps display. No external animation
 * libraries — just `setInterval` driving an index state.
 */
export function AnimationPlayer({
  frames,
  fps,
  truncated,
  caption,
}: {
  frames: string[];
  fps: number;
  truncated?: boolean;
  caption?: string;
}) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Clamp fps to a sensible range so the player never freezes the tab.
  const safeFps = Math.max(1, Math.min(60, Math.round(fps)));
  const intervalMs = Math.round(1000 / safeFps);
  const total = frames.length;

  useEffect(() => {
    if (!playing || total === 0) return;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % total);
    }, intervalMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [playing, intervalMs, total]);

  // If the frame list shrinks (re-run), keep index in range.
  useEffect(() => {
    if (index >= total) setIndex(0);
  }, [total, index]);

  if (total === 0) return null;

  return (
    <Card interactive={false} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.30em] text-[var(--accent)]">
          Animation
        </p>
        <p className="font-mono text-[11px] tabular-nums text-[var(--ink-faint)]">
          frame {index + 1} / {total} · {safeFps} fps
        </p>
      </div>

      <div className="overflow-hidden rounded-[18px] bg-white p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/png;base64,${frames[index]}`}
          alt={caption ?? `Animation frame ${index + 1}`}
          className="block w-full"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          className="inline-flex items-center justify-center rounded-full bg-[#0066CC] px-4 py-1.5 text-[13px] font-medium text-white transition-transform duration-300 hover:-translate-y-[2px] hover:bg-[#0077DD]"
        >
          {playing ? "Pause" : "Play"}
        </button>

        <input
          type="range"
          min={0}
          max={total - 1}
          value={index}
          onChange={(e) => {
            setPlaying(false);
            setIndex(Number(e.target.value));
          }}
          className="flex-1 min-w-[160px] accent-[#0066CC]"
          aria-label="Scrub animation"
        />

        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setPlaying(false);
            setIndex(0);
          }}
        >
          Reset
        </Button>
      </div>

      {truncated ? (
        <p className="text-[12px] text-[var(--ink-faint)]">
          Truncated to 120 frames.
        </p>
      ) : null}
      {caption ? (
        <p className="text-[13px] text-[var(--ink-muted)]">{caption}</p>
      ) : null}
    </Card>
  );
}
