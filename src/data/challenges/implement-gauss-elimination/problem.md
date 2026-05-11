# Solve Ax = b with Gaussian Elimination

A robot's least-squares calibrator, an EKF update, and the inverse kinematics jacobian solve all bottom out at `Ax = b`. Implement the textbook routine yourself so you understand exactly when it breaks.

## Task

Implement `gauss_solve(A, b)` that returns the solution `x` to `A x = b` using **Gaussian elimination with partial pivoting**, without calling `numpy.linalg.solve`, `numpy.linalg.inv`, `numpy.linalg.lstsq`, or `scipy.linalg.*`.

## Inputs

- `A` — a square `numpy.ndarray` of shape `(n, n)`
- `b` — a 1D `numpy.ndarray` of shape `(n,)`

## Output

- `x` — a 1D `numpy.ndarray` of shape `(n,)` such that `A @ x ≈ b` within `1e-8`.

## Errors

- If at any elimination step the pivot column has no nonzero entry below (including the diagonal), the matrix is singular — raise a `SingularMatrixError`. A starter definition is provided.

## Example

```python
A = np.array([[2.0, 1.0], [5.0, 7.0]])
b = np.array([11.0, 13.0])
gauss_solve(A, b)   # -> array([7.111..., -3.222...])
```

## Hints

- Work on copies of `A` and `b` so you don't mutate the caller's arrays.
- Partial pivoting: at column `k`, swap row `k` with whichever row `i >= k` has the largest `|A[i, k]|`. This is what gives you numerical stability.
- After elimination you have an upper-triangular system — solve with back-substitution.
- Use a small tolerance (`1e-12`) to detect singularity.
