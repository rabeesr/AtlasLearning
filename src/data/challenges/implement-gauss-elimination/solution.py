import numpy as np


class SingularMatrixError(ValueError):
    """Raised when the arm is in a degenerate pose (zero pivot column)."""


def gauss_solve(A, b):
    """Solve A x = b via Gaussian elimination with partial pivoting.

    Scenario: solving the static-equilibrium force balance of a 3-link arm.
    A singular A corresponds to a kinematically degenerate pose.
    """
    A = np.array(A, dtype=float, copy=True)
    b = np.array(b, dtype=float, copy=True)
    n = A.shape[0]
    if A.shape != (n, n):
        raise ValueError(f"A must be square, got shape {A.shape}")
    if b.shape != (n,):
        raise ValueError(f"b must have shape ({n},), got {b.shape}")

    tol = 1e-12

    # Teaching print: dimension of the equilibrium system being solved.
    print(f"gauss_solve: solving {n}x{n} system")

    # ---- Forward elimination with partial pivoting --------------------------
    for k in range(n):
        # Find the row with the largest |A[i, k]| at or below row k.
        pivot_row = k + int(np.argmax(np.abs(A[k:, k])))
        # Teaching print: which row got promoted to pivot, and the pivot value.
        print(
            f"  step {k}: pivot row {pivot_row}, "
            f"pivot value {A[pivot_row, k]:.6g}"
        )
        if abs(A[pivot_row, k]) < tol:
            # The arm is in a degenerate pose — refuse to produce garbage.
            raise SingularMatrixError(
                f"matrix is singular at column {k} (degenerate pose)"
            )
        if pivot_row != k:
            A[[k, pivot_row]] = A[[pivot_row, k]]
            b[k], b[pivot_row] = b[pivot_row], b[k]

        # Eliminate every entry below the pivot.
        for i in range(k + 1, n):
            factor = A[i, k] / A[k, k]
            A[i, k:] = A[i, k:] - factor * A[k, k:]
            b[i] = b[i] - factor * b[k]

    # ---- Back substitution --------------------------------------------------
    x = np.zeros(n)
    for i in range(n - 1, -1, -1):
        x[i] = (b[i] - float(np.sum(A[i, i + 1:] * x[i + 1:]))) / A[i, i]
        # Teaching print: each unknown as it's resolved, from bottom to top.
        print(f"  back-sub: x[{i}] = {x[i]:.6g}")

    print(f"gauss_solve: x = {x}")
    return x
