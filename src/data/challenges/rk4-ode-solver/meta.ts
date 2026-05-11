import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "rk4-ode-solver",
  title: "Simulate a First-Order Motor Model With RK4",
  summary:
    "Implement the fourth-order Runge-Kutta integrator and simulate a first-order motor (or any lumped robot subsystem) — the fixed-step workhorse behind every dynamics simulator.",
  topicSlugs: ["calculus-robotics", "ordinary-differential-equations"],
  difficulty: "advanced",
  estimatedMinutes: 75,
  hints: [
    "RK4 advances one step at a time using four slope estimates (k1..k4) and a weighted average. Loop over x_grid, advancing y[i] -> y[i+1].",
    "The four slopes evaluate f at the current point, two midpoints, and the endpoint. The midpoints use y_i + (h/2)*k_prev, the endpoint uses y_i + h*k3.",
    "Compute h = x_grid[i+1] - x_grid[i] inside the loop (the grid may be non-uniform). Final update: y[i+1] = y[i] + (h/6)*(k1 + 2*k2 + 2*k3 + k4).",
  ],
};

export default meta;
