import numpy as np


class SingularMatrixError(ValueError):
    """Raised when Gaussian elimination encounters a zero pivot column."""


def gauss_solve(A, b):
    A = np.array(A, dtype=float, copy=True)
    b = np.array(b, dtype=float, copy=True)
    n = A.shape[0]
    if A.shape != (n, n):
        raise ValueError(f"A must be square, got shape {A.shape}")
    if b.shape != (n,):
        raise ValueError(f"b must have shape ({n},), got {b.shape}")

    tol = 1e-12

    # Forward elimination with partial pivoting.
    for k in range(n):
        # Find pivot row.
        pivot_row = k + int(np.argmax(np.abs(A[k:, k])))
        if abs(A[pivot_row, k]) < tol:
            raise SingularMatrixError(
                f"matrix is singular at column {k}"
            )
        if pivot_row != k:
            A[[k, pivot_row]] = A[[pivot_row, k]]
            b[k], b[pivot_row] = b[pivot_row], b[k]

        # Eliminate below.
        for i in range(k + 1, n):
            factor = A[i, k] / A[k, k]
            A[i, k:] = A[i, k:] - factor * A[k, k:]
            b[i] = b[i] - factor * b[k]

    # Back substitution.
    x = np.zeros(n)
    for i in range(n - 1, -1, -1):
        x[i] = (b[i] - float(np.sum(A[i, i + 1:] * x[i + 1:]))) / A[i, i]
    return x
