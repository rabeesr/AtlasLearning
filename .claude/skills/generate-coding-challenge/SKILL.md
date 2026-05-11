---
name: generate-coding-challenge
description: Generate a new self-contained Python coding challenge (problem.md, starter.py, solution.py, tests.py, meta.ts) for the AtlasLearning robotics curriculum, register it in practice-repository.ts, and verify the solution passes all tests. Every challenge MUST be framed as a believable robotics scenario (math, physics, chemistry, or engineering). Use when the user asks to "add a coding challenge", "create a Pyodide challenge", or "scaffold a challenge for <topic>".
---

# Generate a Coding Challenge

This skill scaffolds a single Pyodide-runnable Python challenge that plugs into the existing AtlasLearning runner. Every challenge lives at `src/data/challenges/<slug>/` and is composed by `src/lib/practice/challenge-repository.ts`.

## Core voice: robotics-framed, rigorous

Every challenge MUST open with a real robotics scenario before stating the precise computational task. The point is that learners always see *why a roboticist cares* before they see the math. Keep prose tight and informational — the visual aesthetic is Apple.com-clean, no marketing fluff.

The discipline a challenge tests is dictated by the curriculum topic, not always math. Use the right tool:

- **Math / linear algebra / calculus.** Frame transforms, Jacobians, Kalman updates, quadrature, ODE integration as the concrete sub-problem inside a planning, sensing, or control pipeline. Examples: rotating a sensor reading into the base frame, solving the static-equilibrium force balance of an arm, integrating a velocity profile to recover distance.
- **Physics — dynamics & control.** Pendulums, mass-spring-dampers, first-order motor models, friction models, ballistic trajectories of a thrown gripper, conservation of momentum on a mobile base. Tests can check that energy is conserved / dissipated, that a controller stabilizes a setpoint, or that a simulator matches an analytic solution.
- **Physics — sensors & signals.** IMU bias estimation, LiDAR ray casting, image projection through a pinhole camera, low-pass / Kalman filtering of a noisy signal, FFT of a vibration spectrum, sensor fusion under known covariances.
- **Chemistry — rare but real.** Battery state-of-charge from a coulomb-counting integral, battery thermal models (Arrhenius-rate degradation), electrolyte / fuel-cell stoichiometry, material yield strength as a constraint on a gripper. Frame as "the controller / planner needs this number to decide X" rather than as bench chemistry.
- **Engineering — components & tolerances.** Gear-ratio selection, motor torque-vs-speed curves and operating-point intersection, bearing life under load, tolerance stack-up on a mechanical assembly, thermal limits on a stepper, link-mass budget for a quadrotor. Tests can check feasibility under real-world constraints and that the function refuses an infeasible spec with a typed exception.

If the curriculum topic is one you have not authored before, pick the discipline that most naturally tests the *underlying concept* — not always math. A "battery management" topic is not a math problem.

## Inputs you need from the user

Before generating anything, confirm:

1. **`topic_slug`** — the primary topic this challenge teaches (e.g. `calculus-robotics`, `linear-algebra-robotics`, `pid-controllers`). Must be a slug that already exists in `src/data/domains/robotics/curriculum.yaml`.
2. **`brief`** — one or two sentences describing what the learner will implement.
3. **`difficulty`** — `beginner`, `intermediate`, or `advanced`. (Drives `estimatedMinutes` heuristic: 20–35, 40–60, 60–90.)
4. (Optional) **`subtopic_slug`** — a finer-grained topic tag to add alongside the primary one.

If the user gave a fuzzy brief, restate it concretely (name the function, name the robotics scenario, list the inputs/outputs with units) and confirm before continuing.

## Allowed Python dependencies

The Pyodide runtime preinstalls `numpy`, `scipy`, `sympy`, `matplotlib` and exposes a project-specific helper module `robotics` (rotations + homogeneous transforms — see existing `fk-six-dof-arm` challenge). Don't introduce other packages unless absolutely required; if you must, set `pythonPackages` in `meta.ts` to the extra pip names.

## Layout you must produce

Create `src/data/challenges/<slug>/` with exactly five files:

### `problem.md`

Structure (see `matrix-vector-multiply/problem.md` post-rewrite for the canonical example):

```
# <Title that names the robotics scenario, not the algorithm>

<2-4 sentence scenario paragraph. Set the robotics context: what the
robot is doing, what data is on hand, what decision rests on this
computation. End with "you will build X" or "you need to compute Y".>

## Task
<Function name, what it must do, what it MUST NOT call from the stdlib/numpy/scipy/scipy.integrate. State the precise mathematical or engineering operation crisply.>

## Inputs
- bullet list with types, shapes, AND units where relevant
  (rad, rad/s, N, m, kg*m^2, etc.)

## Output
- bullet describing return type / shape / units

## Errors
- when to raise, what exception, and a substring the test will look for
  in the message. Tie the error to the real-world failure mode
  ("a singular A means the arm is in a degenerate pose").

## Worked example
Short, copy-pasteable usage snippet in a fenced ```python block. Include units.

## Tests you'll be graded against
- Bullet per test, English-readable: "test_rotates_unit_x_into_y -- a 90deg z-rotation maps e_x to e_y."
- Helps learners reason about edge cases before they hit them.

## What to watch out for
- 3-5 bullets on numerical stability, edge cases, performance, off-by-one
  pitfalls. Tie each to the scenario where possible. Do NOT spoil the algorithm.
```

### `starter.py`

- Imports the modules the user will need.
- Defines the target function with full docstring (Parameters / Returns / Raises sections).
- Body is `raise NotImplementedError("<fn> not implemented yet")`.
- For challenges that need a custom exception (e.g. `SingularMatrixError`), define that class in the starter too.
- **No `print` statements in the starter.** Keep it clean — learners add their own.

### `solution.py`

- Clean, readable reference implementation. No clever tricks.
- Same imports as starter. Same public API. Must pass every test in `tests.py`.
- **Add `print(...)` statements at critical points** so a learner running the reference solution sees intermediate values: shapes, pivots, iteration counts, eigenvalue estimates, RK4 k values, etc. Each `print` should have a short comment above it explaining what it surfaces, so the prints double as inline teaching. Example: `# Teaching print: pivot row chosen at this step.` then `print(f"  step {k}: pivot row {pivot_row}, value {A[pivot_row, k]:.6g}")`.

### `tests.py`

- 3–6 functions named `def test_<thing>(): ...`. Each runs independently.
- **Test names must read as English** — `test_rotates_unit_x_into_y`, `test_singular_pose_raises`, `test_handles_nonuniform_grid`, `test_exact_on_cubic_trajectory`. The UI may show test names to learners.
- **Every `assert` MUST carry a meaningful message that explains WHY it failed and includes the observed value**: `assert <cond>, f"explain why this should hold; expected {e}, got {value}"`. Failures must teach.
- Use `np.allclose` / scalar `abs(... - expected) < tol` rather than `==` for floats.
- Top-level imports/helpers (e.g. `import numpy as np`) are shared across tests — the loader extracts them as a prelude.
- Tests reference the user-defined names directly; do NOT do `from solution import foo` — the runner injects the user's code into the test namespace.

### `meta.ts`

```ts
import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "<slug>",
  title: "<Title — names the robotics scenario>",
  summary: "<one-sentence pitch for the /challenges card — leads with the scenario>",
  topicSlugs: ["<primary>", "<optional-subtopic>"],
  difficulty: "<beginner|intermediate|advanced>",
  estimatedMinutes: 45,
  hints: [
    // 2-3 entries, ordered easy -> strong. The UI reveals them one at a time.
    // Hint 1: gentle nudge — point at what to think about, not the answer.
    // Hint 2: structural pointer — names the right pattern or formula shape.
    // Hint 3 (optional): near-solution — concrete enough that an unstuck
    //                    learner can finish, but not the literal code.
    "<hint 1>",
    "<hint 2>",
    "<hint 3>",
  ],
  // pythonPackages: ["package-name"], // only if needed
};

export default meta;
```

The `hints` field is wired through `src/types/practice.ts` and `src/lib/practice/challenge-repository.ts` into the `CodingChallenge` object; the UI renders them progressively.

## Registration

Open `src/lib/practice/practice-repository.ts` and add a `ChallengeItem` to the `challenges` array with the same slug/title/summary/topicSlugs/difficulty/estimatedMinutes, `kind: "challenge"`, `language: "Python"`. Group it near related linear-algebra / calculus / dynamics / etc. entries.

If a placeholder with the same slug already exists, **update it in place** — do not duplicate.

## Verification

Before reporting done, run the solution against the tests locally:

```bash
python3 - <<'PY'
import importlib.util, pathlib, traceback
slug = "<your-slug>"
base = pathlib.Path("src/data/challenges") / slug
ns = {}
exec((base / "solution.py").read_text(), ns)
exec((base / "tests.py").read_text(), ns)
failures = 0
tests = [(n, fn) for n, fn in ns.items() if n.startswith("test_") and callable(fn)]
for name, fn in tests:
    try:
        fn()
        print(f"  PASS {name}")
    except Exception as exc:
        failures += 1
        print(f"  FAIL {name}: {type(exc).__name__}: {exc}")
print(f"{len(tests) - failures}/{len(tests)} passed")
PY
```

If any test fails, fix `solution.py` (the canonical answer) or relax the test — never alter the test's intent just to make it pass.

## Style guidance

- **Function names**: snake_case, verb-first (`matvec`, `gauss_solve`, `integrate`, `ode_rk4`, `simulate_motor`).
- **Tolerances**: use `1e-6` for ODE / quadrature global error, `1e-8` for linear-solve residuals, `1e-10`+ for exact-on-polynomial checks.
- **No external state**: every test must be self-contained — no fixtures, no shared mutable globals.
- **No I/O**: no `open()`, no network. Challenges run in Pyodide.
- **Determinism**: any randomness must come from `np.random.default_rng(<fixed-seed>)`.
- **Units everywhere**: rad, rad/s, N, m, kg*m^2, A, V, K. Units in problem.md prose, in test comments, and in print statements.

## Worked example (already in the repo)

`src/data/challenges/matrix-vector-multiply/` is the canonical beginner template after the robotics rewrite:

- `problem.md` opens with the camera-frame-to-base-frame sensor-reading scenario, then `Task / Inputs / Output / Errors / Worked example / Tests you'll be graded against / What to watch out for`.
- `starter.py` defines `matvec(A, x)` with a full docstring and a single `raise NotImplementedError` — no prints.
- `solution.py` uses only elementwise ops (`np.sum(A[i] * x)` in a Python loop) — no `np.dot` / `@`. Has teaching prints for shape validation and per-row contributions.
- `tests.py` has 5 English-named tests: `test_identity_returns_input`, `test_rotates_unit_x_into_y`, `test_zero_vector_returns_zero`, `test_nonsquare_matrix`, `test_shape_mismatch_raises_value_error`. Every assert carries an explanatory message.
- `meta.ts` tags it `["linear-algebra-robotics", "matrix-vector-operations"]`, `beginner`, 30 min, with three progressive hints (think-about, structural, near-solution).

Read it end-to-end before authoring a new one. The other five rewritten challenges (`implement-gauss-elimination`, `power-iteration-eigenvalue`, `numerical-derivative`, `simpson-integration`, `rk4-ode-solver`) follow the same template at intermediate/advanced difficulty and across different disciplines (linear algebra, dynamics, quadrature, ODE integration).

## When done

Report to the user:
- Path to the new challenge directory
- The robotics scenario in one line (so they can sanity-check the framing)
- Number of tests authored and that they all pass against `solution.py`
- Number of hints authored
- The line you added to `practice-repository.ts`
- Whether the slug appears at `/challenges/<slug>` (it will, once Next.js picks up the registered item)
