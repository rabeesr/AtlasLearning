# Dominant Inertia Mode via Power Iteration

A robot arm's mass distribution is summarized by a symmetric positive-definite **inertia matrix** `M`. The largest eigenvalue of `M` tells you the direction in which the arm is hardest to accelerate — the dominant inertial mode. The same problem shows up in SLAM (the dominant axis of a landmark covariance ellipsoid) and in stability analysis of a linearized controller.

Calling `numpy.linalg.eig` is one line. But on an embedded controller, the cheapest reliable algorithm is **power iteration**: a handful of matrix-vector products and you have the dominant eigenpair.

## Task

Implement `power_iteration(A, num_iters=1000, tol=1e-10)` returning a `(eigenvalue, eigenvector)` pair where `eigenvalue` is the dominant (largest-magnitude) eigenvalue of `A` and `eigenvector` is its unit-norm eigenvector.

You may **not** call `numpy.linalg.eig`, `numpy.linalg.eigvals`, `numpy.linalg.eigh`, `numpy.linalg.svd`, or `scipy.linalg.eig*`.

## Inputs

- `A` — a square `numpy.ndarray` of shape `(n, n)`, real entries (in our scenario, symmetric positive-definite — an inertia or covariance matrix; units kg*m^2 or similar).
- `num_iters` — maximum iterations (default `1000`).
- `tol` — convergence tolerance on the Rayleigh-quotient delta between successive iterations (default `1e-10`).

## Output

- `(eigenvalue, eigenvector)` where:
  - `eigenvalue` is a `float` (units of A's diagonal).
  - `eigenvector` is a 1D `numpy.ndarray` of shape `(n,)` with `||eigenvector|| == 1`. Direction is the dominant principal axis; sign is arbitrary.

## Worked example

A diagonal inertia tensor whose largest eigenvalue is the dominant moment of inertia about its axis:

```python
M = np.diag([5.0, 2.0, 1.0])           # kg*m^2
lam, v = power_iteration(M)
# lam -> ~5.0, v -> ~[+/-1, 0, 0]
```

## Tests you'll be graded against

- `test_diagonal_inertia_dominant_mode` — diagonal `M`; the largest diagonal entry wins.
- `test_eigenvector_satisfies_relation` — output `v` must satisfy `A v ~ lam v`.
- `test_symmetric_3x3_known_spectrum` — SPD 3x3; agrees with `np.linalg.eigvalsh` to 1e-5 (used as ground truth, not in your solution).
- `test_returns_unit_eigenvector` — `||v|| == 1` and `v` aligns with the dominant axis.

## What to watch out for

- **Determinism.** Seed your random start vector: `rng = np.random.default_rng(0)`. Otherwise tests flake.
- **Renormalize every iteration.** `v = (A @ v); v /= ||v||`. Without this, `v` either blows up or underflows.
- **Convergence on the Rayleigh quotient**, not on `v` itself — eigenvectors can sign-flip and confuse a naive `||v - v_prev||` check.
- **Zero-norm guard.** If the matrix annihilates your start vector (rare), `||A v|| == 0`. Return early instead of dividing by zero.
