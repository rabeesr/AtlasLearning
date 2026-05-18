import { resolveCitation } from "@/lib/tutor/citation-targets";

/**
 * Replace `[source:section]` (and bare `[source]`) citation tokens in tutor
 * output with proper markdown links so they render as clickable. Unknown
 * sources are left as-is so the user sees the raw tag rather than a dead
 * link.
 *
 * Negative-lookahead `(?!\()` keeps us from clobbering real markdown links
 * like `[label](url)` — those have `(` immediately after `]`.
 *
 * Code fences (` ``` ... ``` `) and inline code (`` `...` ``) are protected
 * so citation-looking text inside code blocks stays verbatim.
 */
export function linkifyCitations(text: string): string {
  if (!text) return text;

  // Split out fenced and inline code regions so we don't rewrite their bodies.
  const protectedRanges: { start: number; end: number }[] = [];
  const fenceRe = /```[\s\S]*?```/g;
  const inlineRe = /`[^`\n]+`/g;
  let m: RegExpExecArray | null;
  while ((m = fenceRe.exec(text)) !== null) {
    protectedRanges.push({ start: m.index, end: m.index + m[0].length });
  }
  while ((m = inlineRe.exec(text)) !== null) {
    protectedRanges.push({ start: m.index, end: m.index + m[0].length });
  }

  const isProtected = (i: number) =>
    protectedRanges.some((r) => i >= r.start && i < r.end);

  const citationRe = /\[([a-z0-9][a-z0-9-]+)(?::([^\]]+))?\](?!\()/g;

  return text.replace(citationRe, (match, source: string, section?: string, ...rest) => {
    // ReplacerFn passes match offset as the second-to-last arg.
    const offset = rest[rest.length - 2] as number;
    if (isProtected(offset)) return match;
    const resolved = resolveCitation(source, section);
    if (resolved.kind === "unknown") return match;
    return `[${resolved.label}](${resolved.href})`;
  });
}
