# Solve the Static-Equilibrium Force Balance for a 3-Link Arm

A 3-link planar manipulator is holding a payload motionless. Each joint applies an unknown torque, and the static force/moment balance on the arm produces a linear system `A x = b` where `x` is the vector of joint reactions. To know whether the motors can hold the pose, you need to solve for `x`.

If the arm hits a **kinematically degenerate (singular) pose** — links collinear, a joint locked — the matrix `A` loses rank and the system has no unique solution. A real controller must detect this and refuse to act, not silently divide by zero.

You will build the textbook routine yourself so you understand exactly when it breaks.

## Task

Implement `gauss_solve(A, b)` that returns the solution `x` to `A x = b` using **Gaussian elimination with partial pivoting**, without calling `numpy.linalg.solve`, `numpy.linalg.inv`, `numpy.linalg.lstsq`, or `scipy.linalg.*`.

If the system is singular (a pivot column collapses), raise `SingularMatrixError` — a starter definition is provided in `starter.py`. This is the controller's "degenerate pose" signal.

## Inputs

- `A` — a square `numpy.ndarray` of shape `(n, n)`. In our scenario, the coefficient matrix from the equilibrium equations (units depend on row: forces in N, moments in N*m).
- `b` — a 1D `numpy.ndarray` of shape `(n,)`. The right-hand side (external load and gravity terms).

## Output

- `x` — a 1D `numpy.ndarray` of shape `(n,)` such that `A @ x` reproduces `b` within `1e-8`. Entries are the unknown joint reactions.

## Errors

- If at any elimination step the pivot column has no nonzero entry on or below the diagonal, raise `SingularMatrixError`. This corresponds to the arm being in a degenerate pose.

## Worked example

For a toy 2x2 reduced equilibrium:

```python
A = np.array([[2.0, 1.0], [5.0, 7.0]])   # coefficient matrix
b = np.array([11.0, 13.0])               # external loads (N)
gauss_solve(A, b)   # -> array([7.111..., -3.222...])  # joint reactions (N)
```

## Tests you'll be graded against

- `test_solves_2x2_system` — basic equilibrium of a 2-DOF reduced system.
- `test_solves_3x3_system` — full 3-link arm, well-conditioned pose.
- `test_requires_pivoting` — a pose whose row order puts a zero on the diagonal; without partial pivoting you'd divide by zero.
- `test_identity_returns_b` — an already-decoupled system should pass straight through.
- `test_singular_pose_raises` — a rank-deficient `A` (e.g. two links collinear) must raise `SingularMatrixError`.

## What to watch out for

- **Mutating the caller's arrays.** Work on copies of `A` and `b`. A controller will reuse them.
- **Pivot selection.** At column `k`, swap row `k` with whichever row `i >= k` has the largest `|A[i, k]|`. Without this, near-zero pivots blow up.
- **Singularity tolerance.** Use `1e-12`. Strict equality to zero never triggers on float arithmetic.
- **Back-substitution direction.** Go from the last row upward; each `x[i]` depends on the already-solved entries below it.
