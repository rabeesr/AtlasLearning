"use client";

import type { TutorDiffLine } from "@/lib/tutor/types";

export function TutorDiffBubble({ diff }: { diff: TutorDiffLine[] }) {
  if (!diff.length) return null;
  return (
    <div className="mt-2 overflow-hidden rounded-[14px] bg-[#1D1D1F] font-mono text-[12.5px] leading-6">
      {diff.map((d, i) => (
        <div key={i} className="px-3 py-1.5">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#F5F5F7]/40">
            line {d.line}
          </div>
          <div className="mt-1 bg-[color-mix(in_srgb,#D70015_22%,#1D1D1F)] px-2 py-1 text-[#FFB3B3]">
            <span className="opacity-60">- </span>
            {d.before}
          </div>
          <div className="mt-1 bg-[color-mix(in_srgb,#34C759_22%,#1D1D1F)] px-2 py-1 text-[#B8F0C5]">
            <span className="opacity-60">+ </span>
            {d.after}
          </div>
        </div>
      ))}
    </div>
  );
}
