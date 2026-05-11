import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "power-iteration-eigenvalue",
  title: "Dominant Eigenvalue via Power Iteration",
  summary:
    "Find the largest eigenvalue without np.linalg.eig — the workhorse behind PCA, PageRank, and stability analysis.",
  topicSlugs: ["linear-algebra-robotics", "eigenvalues-eigenvectors"],
  difficulty: "advanced",
  estimatedMinutes: 75,
};

export default meta;
