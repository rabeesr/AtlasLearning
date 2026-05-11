import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "matrix-vector-multiply",
  title: "Rotate a Sensor Reading Into the Base Frame",
  summary:
    "Build matvec by hand to transform a camera-frame point into the robot base frame — the operation behind every Jacobian and Kalman update.",
  topicSlugs: ["linear-algebra-robotics", "matrix-vector-operations"],
  difficulty: "beginner",
  estimatedMinutes: 30,
  hints: [
    "Output entry i depends on row i of A and all of x — not column i. Sketch the indices on paper before you write the loop.",
    "Reach for `np.sum(A[i] * x)` inside a single Python `for` loop over rows. NumPy's elementwise `*` is allowed; the `@` operator is not.",
    "Validate shapes before the loop: m, n = A.shape, then check n == x.shape[0]. Allocate `out = np.zeros(m)` and fill it row by row.",
  ],
};

export default meta;
