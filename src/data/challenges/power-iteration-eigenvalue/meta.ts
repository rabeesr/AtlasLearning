import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "power-iteration-eigenvalue",
  title: "Dominant Inertia Mode via Power Iteration",
  summary:
    "Find the largest eigenvalue of a robot's inertia or covariance matrix — the workhorse behind PCA, SLAM uncertainty, and stability analysis.",
  topicSlugs: ["linear-algebra-robotics", "eigenvalues-eigenvectors"],
  difficulty: "advanced",
  estimatedMinutes: 75,
  hints: [
    "Power iteration repeatedly applies A to a vector and renormalizes. The result aligns with the eigenvector of the largest-magnitude eigenvalue.",
    "Track convergence on the Rayleigh quotient lam = v @ A @ v, not on v itself — v can sign-flip between iterations and look unconverged when it isn't.",
    "Initialize v deterministically with np.random.default_rng(0).normal(size=n), normalize, then loop: w = A @ v; v = w / ||w||; lam = v @ A @ v; stop when |lam - lam_prev| < tol.",
  ],
};

export default meta;
