# Dominant Eigenvalue via Power Iteration

PCA on a covariance matrix, PageRank, and stability analysis of a discrete dynamical system all reduce to "find the largest eigenvalue." The cheapest reliable algorithm is power iteration.

## Task

Implement `power_iteration(A, num_iters=1000, tol=1e-10)` that returns a `(eigenvalue, eigenvector)` pair where `eigenvalue` is the dominant (largest-magnitude) eigenvalue of `A` and `eigenvector` is its unit-norm eigenvector.

Do **not** call `numpy.linalg.eig`, `numpy.linalg.eigvals`, `numpy.linalg.svd`, or `scipy.linalg.eig*`.

## Inputs

- `A` — a square `numpy.ndarray` of shape `(n, n)`, with real entries
- `num_iters` — maximum iterations (default `1000`)
- `tol` — convergence tolerance on the Rayleigh-quotient delta between successive iterations (default `1e-10`)

## Output

- `(eigenvalue, eigenvector)` where:
  - `eigenvalue` is a `float`
  - `eigenvector` is a 1D `numpy.ndarray` of shape `(n,)` with `||eigenvector|| == 1`

## Hints

- Start from a random vector `v0 = np.random.default_rng(0).normal(size=n)` so tests are deterministic. Normalize it.
- Iterate `v = A @ v; v /= ||v||`. Track the Rayleigh quotient `λ = vᵀ A v` and stop once successive `λ` values differ by less than `tol`.
- The returned eigenvector may be sign-flipped — that's fine. Tests compare absolute values.
- For a 2×2 case `[[2, 0], [0, 1]]`, the dominant eigenvalue is `2.0`.

## Acceptance

Tests use symmetric matrices with known spectra; tolerance is `1e-6` on the eigenvalue.
