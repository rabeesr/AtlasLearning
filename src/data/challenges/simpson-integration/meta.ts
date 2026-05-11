import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "simpson-integration",
  title: "Distance Travelled From a Velocity Profile",
  summary:
    "Integrate a planned velocity profile to recover travelled distance — 4x more accurate than the trapezoidal rule and exact on cubic spline trajectories.",
  topicSlugs: ["calculus-robotics", "limits-integration"],
  difficulty: "intermediate",
  estimatedMinutes: 45,
  hints: [
    "Sample f at n+1 equally spaced points x_i = a + i*h, where h = (b-a)/n. Then combine the samples with weights.",
    "Weight pattern: 1 at the endpoints, 4 at odd indices, 2 at even interior indices, then multiply the sum by h/3.",
    "Validate n is a positive even int before computing anything. Use `if not isinstance(n, int) or n <= 0 or n % 2 != 0: raise ValueError(...)`.",
  ],
};

export default meta;
