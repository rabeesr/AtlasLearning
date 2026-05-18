# Solving linear systems: practical guide

Solving \(A x = b\) is the most common subroutine in robotics — every least-squares fit, every Newton step, every Kalman update routes through it. This page is about which tool to reach for, not how to teach Gaussian elimination in a textbook.

## The library call you should usually make

In Python: `x = np.linalg.solve(A, b)`. Internally this is LU with partial pivoting. Numerically stable for well-conditioned \(A\), \(O(n^3)\) flops, the right default.

**Do not** write `x = np.linalg.inv(A) @ b`. It is slower, less accurate, and signals to readers that you don't know the difference. The only valid reason to compute an explicit inverse is if you need every column of it.

## Square but rank-deficient or ill-conditioned

If \(A\) is square but very close to singular, `np.linalg.solve` will return garbage with no warning. Symptoms: cart-pole controllers that explode, Jacobian-inverse motions that flip wildly near singularities, Kalman filter covariance going negative.

Diagnosis: `np.linalg.cond(A)`. If \(\operatorname{cond}(A) > 10^{10}\), do not invert directly.

Fixes:
- **Tikhonov regularization**: solve \((A^\top A + \lambda I) x = A^\top b\) for a small \(\lambda\). Adds a tiny "preferring small x" prior.
- **Pseudoinverse**: `np.linalg.pinv(A) @ b` uses SVD and is well-defined for any matrix shape. Use this for damped-least-squares manipulator inverse kinematics near singularities.

## Overdetermined (more equations than unknowns)

Least squares. Three equivalent formulations:

1. **Normal equations**: \(A^\top A x = A^\top b\). Concise but conditioning of \(A^\top A\) is the *square* of conditioning of \(A\). Use only if \(A\) is well-conditioned and you need the speed.
2. **QR**: \(A = QR\), solve \(R x = Q^\top b\). Stable and the default for `np.linalg.lstsq`.
3. **SVD**: \(A = U \Sigma V^\top\), \(x = V \Sigma^+ U^\top b\). Most robust, more expensive. The right tool when the matrix is rank-deficient.

`np.linalg.lstsq(A, b)` does the right thing by default.

## Underdetermined (more unknowns than equations)

There are infinitely many solutions. The pseudoinverse gives you the minimum-norm one — useful for inverse kinematics ("smallest joint motion that achieves this end-effector velocity"). For redundant manipulators, you typically want a *weighted* pseudoinverse, where the weight matrix encodes joint-limit avoidance or stiffness preferences.

## A sanity-check pattern

When debugging a linear-system bug, do all three:

```python
x = np.linalg.solve(A, b)
residual = A @ x - b
print(np.linalg.norm(residual), np.linalg.cond(A))
```

A large residual with a small condition number means a coding mistake. A small residual with a huge condition number means the answer is correct but meaningless — the problem is ill-posed and you need a different formulation.
