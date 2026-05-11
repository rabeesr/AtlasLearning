import numpy as np


def power_iteration(A, num_iters=1000, tol=1e-10):
    A = np.asarray(A, dtype=float)
    n = A.shape[0]
    if A.shape != (n, n):
        raise ValueError(f"A must be square, got {A.shape}")

    rng = np.random.default_rng(0)
    v = rng.normal(size=n)
    v = v / np.linalg.norm(v)

    lam_prev = 0.0
    for _ in range(num_iters):
        w = A @ v
        norm = np.linalg.norm(w)
        if norm == 0.0:
            return 0.0, v
        v = w / norm
        lam = float(v @ A @ v)
        if abs(lam - lam_prev) < tol:
            return lam, v
        lam_prev = lam
    return lam_prev, v
