# Matrix calculus quickref

A pocket reference for the matrix derivatives that show up most often in robotics — manipulator Jacobians, Kalman filters, least squares, neural network controllers. Conventions assume column vectors and **denominator layout** (gradient of a scalar is a column vector the same shape as the variable).

## Gradients of scalar-valued functions

For \(f: \mathbb{R}^n \to \mathbb{R}\) and column vector \(x \in \mathbb{R}^n\):

- \(\nabla_x (a^\top x) = a\)
- \(\nabla_x (x^\top a) = a\)
- \(\nabla_x (x^\top x) = 2x\)
- \(\nabla_x (x^\top A x) = (A + A^\top) x\). If \(A\) is symmetric, this is \(2 A x\).
- \(\nabla_x \|Ax - b\|^2 = 2 A^\top (Ax - b)\) — the workhorse for linear least squares.

## Jacobians of vector-valued functions

For \(f: \mathbb{R}^n \to \mathbb{R}^m\), the Jacobian \(J \in \mathbb{R}^{m \times n}\) has entries \(J_{ij} = \partial f_i / \partial x_j\). Two identities you will keep needing:

- \(\frac{\partial}{\partial x}(A x) = A\)
- Chain rule: if \(z = g(y)\) and \(y = f(x)\), then \(\frac{\partial z}{\partial x} = \frac{\partial g}{\partial y} \cdot \frac{\partial f}{\partial x}\). In robotics this is exactly how velocity propagates through a kinematic chain: joint velocity \(\dot q\) → link velocity → end-effector twist.

## Trace and Frobenius identities

- \(\nabla_A \operatorname{tr}(AB) = B^\top\)
- \(\nabla_A \operatorname{tr}(A^\top B) = B\)
- \(\nabla_A \|A\|_F^2 = 2A\). \(\|A\|_F^2 = \operatorname{tr}(A^\top A)\), so this is just the previous rule.

## Why this is on the reference shelf

If you can recognize a quadratic form (\(x^\top A x\)), a least-squares residual, or a chain of linear maps, you can write its gradient down without re-deriving it. That speed lets you tune controllers and estimators by editing equations rather than re-doing calculus.
