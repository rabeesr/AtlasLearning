import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "implement-gauss-elimination",
  title: "Static-Equilibrium Force Balance for a 3-Link Arm",
  summary:
    "Solve A x = b for joint reactions using Gaussian elimination with partial pivoting — and detect degenerate poses before the controller acts on them.",
  topicSlugs: ["linear-systems", "linear-algebra-robotics"],
  difficulty: "intermediate",
  estimatedMinutes: 60,
  hints: [
    "Two phases: forward elimination (zero out everything below each pivot) then back substitution (solve from the last row upward). Don't try to fuse them.",
    "Partial pivoting = at column k, pick the row with the largest |A[i, k]| for i >= k and swap it into row k. This is the line that keeps the algorithm stable.",
    "After forward elimination A is upper-triangular. Then x[i] = (b[i] - sum(A[i, i+1:] * x[i+1:])) / A[i, i]. If |A[k, k]| < 1e-12 at any step, raise SingularMatrixError.",
  ],
};

export default meta;
