type AnchoredTopicSlug = "linear-algebra-robotics" | "calculus-robotics";

const SECTION_ANCHORS: Record<AnchoredTopicSlug, Record<string, string>> = {
  "linear-algebra-robotics": {
    "matrix-vector-operations": "matrix-and-vector-operations",
    "linear-systems": "solving-ax-b-lu-decomposition-and-partial-pivoting",
    "eigenvalues-eigenvectors": "eigenvalues-eigenvectors-and-stability",
    "least-squares": "least-squares-and-the-normal-equations",
  },
  "calculus-robotics": {
    "limits-integration": "taylor-expansion-and-linearization",
    "continuous-optimization": "gradient-descent-for-path-planning",
    "ordinary-differential-equations": "ordinary-differential-equations-and-state-space-form",
    "laplace-lagrangian": "lagrange-multipliers-for-constrained-optimization",
  },
} as const;

export function slugifyHeading(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getTopicLearnSectionAnchor(topicSlug: string, subtopicSlug: string): string | null {
  return SECTION_ANCHORS[topicSlug as AnchoredTopicSlug]?.[subtopicSlug] ?? null;
}

export function getSubtopicLearnHref(topicSlug: string, subtopicSlug: string): string {
  const anchor = getTopicLearnSectionAnchor(topicSlug, subtopicSlug);
  return anchor ? `/topics/${topicSlug}/learn#${anchor}` : `/topics/${subtopicSlug}/learn`;
}
