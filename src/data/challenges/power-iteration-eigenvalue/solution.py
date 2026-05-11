import numpy as np


def power_iteration(A, num_iters=1000, tol=1e-10):
    """Dominant eigenpair of A via power iteration.

    Scenario: finding the dominant inertial mode of a robot arm's inertia
    matrix (or the principal axis of a SLAM covariance ellipsoid).
    """
    A = np.asarray(A, dtype=float)
    n = A.shape[0]
    if A.shape != (n, n):
        raise ValueError(f"A must be square, got {A.shape}")

    # Deterministic random start so tests are reproducible.
    rng = np.random.default_rng(0)
    v = rng.normal(size=n)
    v = v / np.linalg.norm(v)

    # Teaching print: starting point of the iteration.
    print(f"power_iteration: n={n}, initial ||v||={np.linalg.norm(v):.6f}")

    lam_prev = 0.0
    for i in range(num_iters):
        w = A @ v
        norm = np.linalg.norm(w)
        if norm == 0.0:
            # Pathological: A annihilates v. Bail out instead of dividing by zero.
            print("  matrix annihilated the iterate; returning 0 eigenvalue")
            return 0.0, v
        v = w / norm
        # Rayleigh quotient: best scalar estimate of the eigenvalue given v.
        lam = float(v @ A @ v)
        # Teaching print every 10 iters so the console isn't spammed.
        if i % 10 == 0 or abs(lam - lam_prev) < tol:
            print(f"  iter {i:4d}: eigval estimate = {lam:.10f}")
        if abs(lam - lam_prev) < tol:
            print(f"power_iteration: converged at iter {i}, lam={lam:.10f}")
            return lam, v
        lam_prev = lam

    print(f"power_iteration: hit max iters, returning lam={lam_prev:.10f}")
    return lam_prev, v
