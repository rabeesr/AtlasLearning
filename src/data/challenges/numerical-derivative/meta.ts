import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "numerical-derivative",
  title: "Angular Velocity From Encoder Samples",
  summary:
    "Estimate instantaneous angular velocity from a discrete encoder profile using a central difference — the way every real robot gradient gets computed.",
  topicSlugs: ["calculus-robotics", "limits-integration"],
  difficulty: "beginner",
  estimatedMinutes: 25,
  hints: [
    "You need two samples — one above x, one below — and the step size h between them. No SymPy, no autograd.",
    "The central difference formula is (f(x + h) - f(x - h)) / (2 * h). That's the whole algorithm.",
    "Don't make h smaller than ~1e-7 in float64; floating-point cancellation in the numerator dominates and accuracy gets worse, not better.",
  ],
};

export default meta;
