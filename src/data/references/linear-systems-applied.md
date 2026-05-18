# Linear systems in robotics, applied

The linear-algebra topic covers vectors, matrices, eigenvalues, and least squares. Each one is a hammer; this page is the nail.

## Forward kinematics as a chain of matrix products

A serial manipulator's end-effector pose is the product of homogeneous transforms, one per joint:

\[
T_{\text{end}} = T_1(q_1) \cdot T_2(q_2) \cdots T_n(q_n).
\]

Each \(T_i\) is a \(4 \times 4\) homogeneous transform composing a rotation and a translation. The order matters: rightmost is closest to the base, leftmost is closest to the end-effector. Composition non-commutative because rotations don't commute.

Why this is on the references shelf: students often try to "add up" the rotations or forget the translation part of the homogeneous matrix. The chain-of-products framing makes the structure obvious.

## Inverse kinematics as a least-squares problem

Given a desired pose, find joint angles. For a redundant manipulator (more joints than task dimensions), the problem is underdetermined and the canonical solution is

\[
\dot q = J^+(q) \, \dot p_{\text{desired}}
\]

where \(J^+\) is the pseudoinverse. Near singularities, \(J\) loses rank and \(J^+\) explodes; **damped least squares** replaces it with \((J^\top J + \lambda I)^{-1} J^\top\) for a small \(\lambda\), trading exactness near singularities for stability.

## State-space representation

Continuous-time linear system:

\[
\dot x = A x + B u, \qquad y = C x + D u.
\]

The four matrices encode everything: \(A\) is internal dynamics, \(B\) is how control enters, \(C\) is what you measure, \(D\) is direct feedthrough (often zero). Controllers, observers, and analyses all boil down to operations on \((A, B, C, D)\).

Discrete-time version replaces \(\dot x\) with \(x_{k+1}\) and \(A, B\) with their discretized counterparts. For a small timestep \(\Delta t\), the discrete \(A_d \approx I + A \Delta t\) (first-order Taylor), or exactly \(A_d = e^{A \Delta t}\) (matrix exponential). For control design, use the exact form.

## Principal Component Analysis as eigenanalysis

PCA finds the directions of maximum variance in a dataset. Compute the covariance matrix \(C = \frac{1}{N} X^\top X\) (after centering), find its eigenvectors, and the top-\(k\) eigenvectors are the \(k\)-dimensional subspace that captures the most variance.

In robotics, PCA is used for:

- Reducing high-dimensional sensor data (lidar, camera features) to a tractable state.
- Identifying the "natural" axes of a rigid body from a point cloud (inertia tensor eigenvectors).
- Compressing motion-capture data into a few synergies.

## Singular Value Decomposition is the most useful tool you don't reach for

\(A = U \Sigma V^\top\) for any \(A\). Three things SVD gives you for free:

1. The closest rank-\(k\) approximation to \(A\) (truncate \(\Sigma\) to the top-\(k\) singular values).
2. The pseudoinverse \(A^+ = V \Sigma^+ U^\top\), well-defined for any matrix shape.
3. The condition number \(\sigma_{\max} / \sigma_{\min}\), which tells you whether \(A\) is numerically safe to invert.

If you find yourself manipulating a matrix and reaching for `inv`, ask whether SVD would tell you the same thing more safely.
