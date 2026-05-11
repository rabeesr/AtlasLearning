---
name: generate-coding-challenge
description: Generate a new self-contained Python coding challenge (problem.md, starter.py, solution.py, tests.py, meta.ts) for the AtlasLearning robotics curriculum, register it in practice-repository.ts, and verify the solution passes all tests. Use when the user asks to "add a coding challenge", "create a Pyodide challenge", or "scaffold a challenge for <topic>".
---

# Generate a Coding Challenge

This skill scaffolds a single Pyodide-runnable Python challenge that plugs into the existing AtlasLearning runner. Every challenge lives at `src/data/challenges/<slug>/` and is composed by `src/lib/practice/challenge-repository.ts`.

## Inputs you need from the user

Before generating anything, confirm:

1. **`topic_slug`** — the primary topic this challenge teaches (e.g. `calculus-robotics`, `linear-algebra-robotics`, `pid-controllers`). Must be a slug that already exists in `src/data/domains/robotics/curriculum.yaml`.
2. **`brief`** — one or two sentences describing what the learner will implement.
3. **`difficulty`** — `beginner`, `intermediate`, or `advanced`. (Drives `estimatedMinutes` heuristic: 20–35, 40–60, 60–90.)
4. (Optional) **`subtopic_slug`** — a finer-grained topic tag to add alongside the primary one.

If the user gave a fuzzy brief, restate it concretely (name the function, list the inputs/outputs) and confirm before continuing.

## Allowed Python dependencies

The Pyodide runtime preinstalls `numpy`, `scipy`, `sympy`, `matplotlib` and exposes a project-specific helper module `robotics` (rotations + homogeneous transforms — see existing `fk-six-dof-arm` challenge). Don't introduce other packages unless absolutely required; if you must, set `pythonPackages` in `meta.ts` to the extra pip names.

## Layout you must produce

Create `src/data/challenges/<slug>/` with exactly five files:

### `problem.md`
Structure to match existing challenges (see `matrix-vector-multiply/problem.md` for the canonical example):

```
# <Title>

<1–2 sentence motivation — why a roboticist cares.>

## Task
<Function name, what it must do, what it MUST NOT call from the stdlib/numpy/scipy.>

## Inputs
- bullet list with types and shapes

## Output
- bullet describing return type/shape

## Errors
- when to raise, what exception, and a substring the test will look for in the message

## Example
Short, copy-pasteable usage snippet in a fenced ```python block.

## Hints
- 2–4 bullets. Point at pitfalls, not the answer.
```

Keep prose tight and informational — the visual aesthetic is Apple.com-clean, no marketing fluff.

### `starter.py`
- Imports the modules the user will need.
- Defines the target function with full docstring (Parameters / Returns / Raises sections).
- Body is `raise NotImplementedError("<fn> not implemented yet")`.
- For challenges that need a custom exception (e.g. `SingularMatrixError`), define that class in the starter too.

### `solution.py`
- Clean, readable reference implementation. No clever tricks.
- Same imports as starter. Same public API. Must pass every test in `tests.py`.

### `tests.py`
- 3–6 functions named `def test_<thing>(): ...`. Each runs independently.
- Every `assert` MUST carry an educational message: `assert <cond>, f"explain what failed; got {value}"`.
- Use `np.allclose` / scalar `abs(... - expected) < tol` rather than `==` for floats.
- Top-level imports/helpers (e.g. `import numpy as np`) are shared across tests — the loader extracts them as a prelude.
- Tests reference the user-defined names directly; do NOT do `from solution import foo` — the runner injects the user's code into the test namespace.

### `meta.ts`

```ts
import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "<slug>",
  title: "<Title>",
  summary: "<one-sentence pitch matching the marketing card in /challenges>",
  topicSlugs: ["<primary>", "<optional-subtopic>"],
  difficulty: "<beginner|intermediate|advanced>",
  estimatedMinutes: 45,
  // pythonPackages: ["package-name"], // only if needed
};

export default meta;
```

## Registration

Open `src/lib/practice/practice-repository.ts` and add a `ChallengeItem` to the `challenges` array with the same slug/title/summary/topicSlugs/difficulty/estimatedMinutes, `kind: "challenge"`, `language: "Python"`. Group it near related linear-algebra / calculus / etc. entries.

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

- **Function names**: snake_case, verb-first (`matvec`, `gauss_solve`, `integrate`, `ode_rk4`).
- **Tolerances**: use `1e-6` for ODE/quadrature global error, `1e-8` for linear-solve residuals, `1e-10`+ for exact-on-polynomial checks.
- **No external state**: every test must be self-contained — no fixtures, no shared mutable globals.
- **No I/O**: no `open()`, no network. Challenges run in Pyodide.
- **Determinism**: any randomness must come from `np.random.default_rng(<fixed-seed>)`.

## Worked example (already in the repo)

`src/data/challenges/matrix-vector-multiply/` is the canonical beginner template:

- `problem.md` opens with one motivating sentence about transforms/Jacobians, then `Task / Inputs / Output / Errors / Example / Hints`.
- `starter.py` defines `matvec(A, x)` with a full docstring and a single `raise NotImplementedError`.
- `solution.py` uses only elementwise ops (`np.sum(A[i] * x)` in a Python loop) — no `np.dot` / `@` operator.
- `tests.py` has 5 tests: identity, zero vector, known small case, nonsquare case, and a `ValueError` check with substring match on `"shape"`.
- `meta.ts` tags it `["linear-algebra-robotics", "matrix-vector-operations"]`, `beginner`, 30 min.

Read it end-to-end before authoring a new one.

## When done

Report to the user:
- Path to the new challenge directory
- Number of tests authored and that they all pass against `solution.py`
- The line you added to `practice-repository.ts`
- Whether the slug appears at `/challenges/<slug>` (it will, once Next.js picks up the registered item)
