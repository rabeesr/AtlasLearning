import { slugifyHeading } from "@/lib/content/topic-learn-sections";

/**
 * Topics that the tutor cites with `[topic-slug:section]`. Kept in sync with
 * the corpus build whitelist in `scripts/build-tutor-corpus.ts`.
 */
export const KNOWN_TOPIC_SLUGS = new Set<string>([
  "linear-algebra-robotics",
  "calculus-robotics",
]);

/**
 * Reference docs in `src/data/references/`. Kept in sync with the directory
 * contents. New reference → add its slug here so citations link out.
 */
export const KNOWN_REFERENCE_SLUGS = new Set<string>([
  "cart-pole-dynamics",
  "common-python-errors",
  "derivatives-as-rates",
  "eigenvalues-stability",
  "gaussian-elimination",
  "kinematics-rotations",
  "linear-systems-applied",
  "matplotlib-animation-cookbook",
  "matrix-calculus-quickref",
  "numerical-integration",
  "numpy-broadcasting-pitfalls",
  "pid-intuition",
  "python-for-control-loops",
]);

export type CitationTarget =
  | { kind: "topic"; href: string; label: string }
  | { kind: "reference"; href: string; label: string }
  | { kind: "unknown"; label: string };

/**
 * Resolve a `[source:section]` citation to an in-app URL when possible.
 * - Topics → `/topics/<slug>/learn#<section-anchor>`
 * - References → `/references/<slug>#<section-anchor>`
 * - Anything else → `unknown` (caller renders as plain text).
 */
export function resolveCitation(
  source: string,
  section: string | undefined,
): CitationTarget {
  const sectionAnchor = section ? `#${slugifyHeading(section)}` : "";
  const label = section ? `${source}:${section}` : source;
  if (KNOWN_TOPIC_SLUGS.has(source)) {
    return {
      kind: "topic",
      href: `/topics/${source}/learn${sectionAnchor}`,
      label,
    };
  }
  if (KNOWN_REFERENCE_SLUGS.has(source)) {
    return {
      kind: "reference",
      href: `/references/${source}${sectionAnchor}`,
      label,
    };
  }
  return { kind: "unknown", label };
}

export { slugifyHeading };
