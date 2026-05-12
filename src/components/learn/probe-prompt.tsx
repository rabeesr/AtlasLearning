"use client";

import { useContext, useEffect, useState } from "react";

import { Badge, Button } from "@/components/shared/ui";
import { EngagementContext } from "@/lib/progress/proficiency-tracker";

/**
 * <ProbePrompt> — inline knowledge-probe card rendered from a `:::probe`
 * markdown block. Shows the question, a brief "Think first…" nudge, then
 * reveals the answer on demand. On reveal, marks a synthetic concept key
 * in `topic_engagement.checked_concepts` so the probe nudges proficiency.
 *
 * Demo users: the engagement tracker itself is in-session for signed-out
 * visitors, so no DB write happens. Signed-in writes flow through the
 * Supabase engagement provider exactly like the regular concept checklist.
 */
export function ProbePrompt({
  topicSlug,
  probeId,
  question,
  answer,
}: {
  topicSlug?: string;
  probeId: string;
  question: string;
  answer: string;
}) {
  const [revealed, setRevealed] = useState(false);
  // Read the tracker via context directly so we degrade gracefully on pages
  // that don't mount an engagement provider (the hook would throw).
  const tracker = useContext(EngagementContext);

  const conceptKey = `probe:${probeId}`;
  const alreadyChecked = topicSlug && tracker
    ? tracker.getEngagement(topicSlug).checkedConcepts.includes(conceptKey)
    : false;

  useEffect(() => {
    if (!revealed) return;
    if (!topicSlug || !tracker) return;
    if (alreadyChecked) return;
    tracker.toggleConcept(topicSlug, conceptKey);
    // We only want to record once per session per probe.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  return (
    <div className="my-6 rounded-[20px] bg-[var(--tile)] p-6 md:p-7">
      <div className="mb-3 flex items-center gap-2">
        <Badge tone="accent">Knowledge probe</Badge>
        {alreadyChecked ? <Badge tone="success">Revealed</Badge> : null}
      </div>
      <p className="text-[16px] font-semibold leading-[1.55] text-[var(--ink)]">
        {question}
      </p>

      {!revealed ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] italic text-[var(--ink-muted)]">
            Think it through first — then reveal.
          </p>
          <Button
            variant="accent"
            size="sm"
            onClick={() => setRevealed(true)}
          >
            Reveal answer
          </Button>
        </div>
      ) : (
        <div
          className="mt-4 overflow-hidden rounded-[14px] bg-white p-4 transition-all duration-300 ease-out"
          style={{ maxHeight: 600 }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[var(--accent)]">
            Answer
          </p>
          <p className="mt-2 text-[15px] leading-[1.65] text-[var(--ink)]">
            {answer}
          </p>
        </div>
      )}
    </div>
  );
}
