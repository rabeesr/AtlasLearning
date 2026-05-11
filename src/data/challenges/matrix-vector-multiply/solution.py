import numpy as np


def matvec(A, x):
    """Reference matrix-vector multiply built from elementwise ops only."""
    A = np.asarray(A, dtype=float)
    x = np.asarray(x, dtype=float)
    if A.ndim != 2:
        raise ValueError(f"A must be 2D, got shape {A.shape}")
    if x.ndim != 1:
        raise ValueError(f"x must be 1D, got shape {x.shape}")
    m, n = A.shape
    if n != x.shape[0]:
        raise ValueError(
            f"shape mismatch: A is ({m},{n}) but x has length {x.shape[0]}"
        )
    out = np.zeros(m, dtype=float)
    for i in range(m):
        out[i] = float(np.sum(A[i] * x))
    return out
