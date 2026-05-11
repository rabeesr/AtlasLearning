import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "implement-gauss-elimination",
  title: "Solve Ax = b with Gaussian Elimination",
  summary:
    "Build the textbook linear solver — partial pivoting included — and learn exactly when it breaks.",
  topicSlugs: ["linear-systems", "linear-algebra-robotics"],
  difficulty: "intermediate",
  estimatedMinutes: 60,
};

export default meta;
