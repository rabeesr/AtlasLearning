import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "rk4-ode-solver",
  title: "Solve an ODE with RK4",
  summary:
    "Implement the fourth-order Runge–Kutta integrator — the fixed-step workhorse behind every dynamics simulator.",
  topicSlugs: ["calculus-robotics", "ordinary-differential-equations"],
  difficulty: "advanced",
  estimatedMinutes: 75,
};

export default meta;
