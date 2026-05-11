import numpy as np


def matvec(A, x):
    """Reference matrix-vector multiply built from elementwise ops only.

    Robotics scenario: rotating a camera-frame point into the base frame.
    """
    A = np.asarray(A, dtype=float)
    x = np.asarray(x, dtype=float)

    # Teaching print: surface the shapes so a learner can see what got passed in.
    print(f"matvec: A.shape={A.shape}, x.shape={x.shape}")

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
        # Row i of A dotted with x — built from elementwise ops, no np.dot.
        row_contrib = float(np.sum(A[i] * x))
        # Teaching print: show each row's contribution to the output vector.
        print(f"  row {i}: A[{i}]={A[i]} -> out[{i}]={row_contrib:.6f}")
        out[i] = row_contrib

    print(f"matvec: out={out}")
    return out
