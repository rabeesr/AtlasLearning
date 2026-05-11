import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "numerical-derivative",
  title: "Numerical Derivatives via Central Differences",
  summary:
    "Estimate f'(x) the way every real-robot gradient gets computed — no symbolic math.",
  topicSlugs: ["calculus-robotics", "limits-integration"],
  difficulty: "beginner",
  estimatedMinutes: 25,
};

export default meta;
