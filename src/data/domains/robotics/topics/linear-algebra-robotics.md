---
title: "Computational Linear Algebra"
summary: "Linear algebra as the algorithmic backend of a robot — vectors as forces, matrices as transformations, decompositions as the way real systems stay stable in finite precision."
learning_objectives:
  - "Reason about vectors, linear combinations, and span as physical quantities (forces, velocities, configurations)."
  - "Solve Ax = b numerically with LU decomposition and partial pivoting, and explain why never to use the inverse."
  - "Construct rotation matrices and homogeneous transforms; compose them to move data between robot frames."
  - "Derive and apply the normal equations for overdetermined systems; sketch how recursive least squares streams that update online."
  - "Use eigenvalues to reason about stability, and SVD to detect singular configurations and ill-conditioned problems."
  - "Implement a SVD-based point-cloud aligner end-to-end (a LIDAR scan matcher) without high-level solvers."
estimated_minutes: 480
prerequisites_recap:
  - "Comfort writing functions, loops, and arrays in a high-level language (Python, Julia, or C++)."
  - "Trigonometry: sin, cos, and the geometry of rotation by an angle in 2D."
sources:
  - "Topic 1 — Linear Algebra (course notes, Atlas robotics curriculum)."
  - "Gilbert Strang, *Linear Algebra and Learning from Data* — recommended companion text."
---

## Why this matters

Robotics is full of quantities that live in space: thrusts, velocities, joint configurations, sensor frames, and the transforms between them. Every estimate a robot makes about itself or the world is a vector or a matrix, and every update is a matrix operation. A drone hovers because the linear combination of its rotor thrusts cancels gravity. A robot arm fails at a *singularity* because the math behind its motion loses a degree of freedom. A self-driving car localizes itself by aligning two LIDAR scans — which is, end to end, an SVD on a small matrix.

The shift this topic asks of you is **algorithmic**: write the operations, run them on noisy data, watch them blow up when matrices are nearly singular. Pencil-and-paper linear algebra teaches you what's true in exact arithmetic. This module teaches you what survives floating point — which is the only kind a robot has.

## Mental model

A matrix is a transformation that takes a vector and produces another vector. Everything else — solving systems, eigendecomposition, least squares, SVD — is a question about *that transformation*: what does it stretch, what does it collapse, what does it leave alone, and when does running it backwards lose information? Hold that picture and the algorithms below stop being arbitrary procedures and start being ways of asking that question with finite-precision arithmetic.

## Key concepts

### Vectors, linear combinations, and span

**Span** — the set of all vectors you can build by scaling and adding a given set of vectors.

A vector in robotics is a *directed arrow*: a force from a thruster, a velocity, a position. If a robot has thrusters producing vectors `v₁` and `v₂`, the span of `{v₁, v₂}` is every direction the robot can move. If `v₁` and `v₂` are **linearly dependent** (parallel), the span collapses to a line and the robot is stuck in one dimension. A drone hovers when the linear combination `c₁v₁ + c₂v₂ + c₃v₃ + c₄v₄` of its rotor thrusts exactly cancels gravity `g` — every control problem is a search for the right coefficients.

### Matrix and vector operations

**Matrix multiplication** — composing two transformations into one.

The four primitives — `dot`, `matmul`, `transpose`, `inverse` — are worth implementing from scratch once. `dot` measures alignment; `matmul` is `dot` applied across rows and columns; `transpose` swaps rows and columns (and the input/output roles of the transformation); `inverse` runs the transformation backwards. Writing them by hand makes indexing concrete and reveals why `inverse` is the expensive, fragile one — it has to undo information loss that may not be undoable.

### Solving Ax = b: LU decomposition and partial pivoting

**LU decomposition** — factor `A = LU` once, then solve cheaply for many right-hand sides.

The most common robotics question is "I know where I want to be (`b`) and how my actuators work (`A`); what command (`x`) do I send?" Naively, `x = A⁻¹b`. In practice, never invert. Instead factor `A = LU` (Lower × Upper triangular), then solve `Ly = b` by forward substitution and `Ux = y` by backward substitution. Gaussian elimination produces this factorization. To prevent dividing by tiny pivots (which amplifies rounding error catastrophically), use **partial pivoting**: at each step, swap rows so the largest available value sits on the diagonal.

### Spatial transformations: rotation matrices and homogeneous transforms

**Rotation matrix `R ∈ SO(n)`** — orthonormal, with `Rᵀ = R⁻¹`. **Homogeneous transform `T ∈ SE(3)`** — a 4×4 matrix that bundles rotation and translation into one multiplication.

A robot constantly translates data between frames: from the camera "eye" to the gripper "hand" to the world. In 2D, rotation by θ is `R(θ) = [[cos θ, −sin θ], [sin θ, cos θ]]`. The orthonormal property `Rᵀ = R⁻¹` is computational gold — *un-rotating* is free, just a transpose, with no numerical risk.

Translation alone is just vector addition; combining rotation and translation cleanly requires the **homogeneous transform**:

```
T = [ R  t ]
    [ 0  1 ]
```

where `R` is 3×3 and `t` is 3×1. Vectors are augmented to `[x, y, z, 1]ᵀ`. Now the entire pipeline "rotate, then translate, then rotate again" is one matrix product. If a camera sees a ball at `P_cam` and you know the camera's pose in the world `T_world_cam`, then `P_world = T_world_cam · P_cam`.

### Least squares and the normal equations

**Least squares** — find the `x` that minimizes `‖Ax − b‖²` when no exact solution exists.

Real sensors are noisy; with more measurements than unknowns the system `Ax = b` is *overdetermined* and has no exact solution. Define the residual `r = b − Ax` and minimize `‖r‖²`. Take the gradient, set to zero, and you get the **normal equations**: `AᵀA x = Aᵀb`, with closed form `x = (AᵀA)⁻¹Aᵀb`. In practice, never form `(AᵀA)⁻¹` — use QR or SVD, which are numerically stable. This is the bedrock for sensor calibration, regression, and the linearized step inside every iterative state estimator.

### Recursive least squares

**Recursive least squares (RLS)** — update the least-squares estimate as each new measurement arrives, without re-solving from scratch.

Robots can't wait for all the data. RLS keeps a running estimate `x̂` and a weighting matrix that tracks how confident we are in each direction; each new measurement nudges `x̂` and tightens the weights. A self-driving car re-estimates the lane line on every video frame this way. RLS is the deterministic, linear ancestor of the Kalman filter — once you understand it, the Kalman filter is just RLS with a process model and noise covariances bolted on.

### Eigenvalues, eigenvectors, and stability

**Eigenvector** — a direction the matrix only scales, never rotates. **Eigenvalue** — the scaling factor.

Eigendecomposition reveals the natural axes of a transformation. **Power iteration** finds the largest eigenvalue cheaply by repeated multiplication; the **QR algorithm** generalizes that to find them all; **PCA** uses eigenvectors of a covariance matrix to find directions of greatest variance. The robotics-critical use is **stability analysis**: a linear dynamical system `ẋ = Ax` is stable iff every eigenvalue of `A` has negative real part. A drone with a positive-real-part eigenvalue will oscillate with growing amplitude until it crashes.

### Singular value decomposition

**SVD** — every matrix factors as `A = UΣVᵀ`, with `U`, `V` orthonormal and `Σ` diagonal of non-negative singular values.

SVD works on any matrix, square or not, singular or not. The diagonal entries of `Σ` (singular values, sorted descending) measure how much the transformation stretches each principal direction. The **condition number** `σ_max / σ_min` measures sensitivity to noise — large means trouble. When `σ_min ≈ 0`, the matrix is *singular* — a robot arm in a singular configuration loses a degree of freedom and inverse kinematics blows up. SVD is also the most numerically reliable tool for least squares, low-rank approximation, and (as below) point-cloud alignment.

## Worked example

**Goal:** the LIDAR scan matcher — given two point clouds taken one second apart, recover the rotation `R` and translation `t` that aligns them. Output: odometry, the robot's ability to know it moved just by looking at the world.

The math: minimize `Σᵢ ‖R·xᵢ + t − yᵢ‖²` over `R ∈ SO(3)` and `t ∈ ℝ³`. The closed-form trick is to center both clouds (so `t` falls out), build a 3×3 cross-covariance, and read `R` straight off its SVD.

```python
import numpy as np

def align(X, Y):
    """X, Y: (N, 3) corresponding points. Returns R (3,3), t (3,)."""
    cx = X.mean(axis=0)
    cy = Y.mean(axis=0)
    Xc = X - cx                           # center both clouds
    Yc = Y - cy

    W = Xc.T @ Yc                         # 3x3 cross-covariance
    U, _, Vt = np.linalg.svd(W)

    # Build R = V Uᵀ, then fix the sign of the last column of V
    # to guarantee a proper rotation (det = +1, not a reflection).
    D = np.eye(3)
    D[2, 2] = np.sign(np.linalg.det(Vt.T @ U.T))
    R = Vt.T @ D @ U.T

    t = cy - R @ cx
    return R, t

# Quick sanity check: rotate + translate a known cloud, recover the transform.
rng = np.random.default_rng(0)
X = rng.normal(size=(50, 3))
R_true = np.array([[ 0.866, -0.5,  0.0],
                   [ 0.5,    0.866, 0.0],
                   [ 0.0,    0.0,   1.0]])  # 30° about z
t_true = np.array([1.0, 2.0, 0.5])
Y = X @ R_true.T + t_true

R_est, t_est = align(X, Y)
print(np.allclose(R_est, R_true, atol=1e-9))   # True
print(np.allclose(t_est, t_true, atol=1e-9))   # True
```

What just happened: the centroid step removes translation; the SVD of the cross-covariance gives the optimal rotation; the sign-fix on `D` rejects the spurious reflection that minimizes residual just as well as the correct rotation but isn't a physical motion. This is the mathematical core of scan-matching odometry.

## Common pitfalls

- **"`inv(A)` is the way to solve `Ax = b`."** Computing the inverse explicitly is slower and numerically worse than LU/QR. Use `solve`, not `inv`. The same applies to `(AᵀA)⁻¹` in least squares — use QR or SVD.
- **"My matrix is invertible, so I can trust the answer."** Invertibility is binary; conditioning is continuous. A nearly-singular matrix gives an answer dominated by noise. Check the condition number (`σ_max / σ_min`) before trusting an inverse or a solve.
- **"To un-rotate, compute the inverse of R."** Rotation matrices are orthonormal: `R⁻¹ = Rᵀ`. The transpose is exact, free, and never blows up. Calling `inv(R)` is wasteful and slightly wrong.
- **"Eigenvectors are unique."** They're defined only up to scale (and sign), and for repeated eigenvalues only the eigen-*space* is unique. Comparing two eigendecompositions naively is a common bug.
- **"SVD always gives me a rotation."** Without the determinant sign-fix in scan matching (or any orthogonal Procrustes problem), you can recover a *reflection* (`det R = −1`), which fits the residual equally well but isn't a physical motion.
- **"Least squares always works."** If columns of `A` are nearly collinear, `AᵀA` is ill-conditioned and the normal-equations approach is unstable. Use QR, or add Tikhonov / ridge regularization.
- **"Row vs column vector doesn't matter."** It does — silently broadcasting the wrong shape is one of the most common sources of bugs in numerical code. Print shapes.

## Self-check

1. A drone has four rotors, each producing a thrust vector `vᵢ`. State the precise condition on `{v₁, v₂, v₃, v₄}` for the drone to be able to hover *and* control orientation. What goes wrong if the four vectors span only a 2D subspace?
2. Why is solving `Ax = b` via LU decomposition with partial pivoting preferred over computing `x = A⁻¹b`? Give one numerical reason and one performance reason.
3. Construct the 2D rotation matrix `R(θ)` and verify algebraically that `Rᵀ = R⁻¹`. Why does this property matter computationally for a robot transforming thousands of points per second?
4. Write a 4×4 homogeneous transform that first rotates 90° about the z-axis and then translates by `[1, 0, 0]`. Apply it to the point `[1, 0, 0, 1]ᵀ`. Where does the point end up?
5. Derive the normal equations from the objective `‖Ax − b‖²`. At which step in the derivation could you switch from "solve via `(AᵀA)⁻¹`" to "solve via QR," and why would you?
6. A linear system `ẋ = Ax` has eigenvalues `{−2, −1+3i, −1−3i}`. Is it stable? What about `{−2, 0.1, −5}`? Explain in one sentence each.
7. SVD gives `A = UΣVᵀ` with `Σ = diag(10, 4, 0.001)`. What's the condition number? What does the small singular value mean physically if `A` is the Jacobian of a robot arm?
8. In the LIDAR scan-matcher, why do we subtract the centroid of each cloud before computing the cross-covariance? What would happen if we skipped that step?
9. Why does the scan-matcher need the determinant sign-fix `D[2,2] = sign(det(VᵀUᵀ))`? What does the "wrong" answer represent geometrically?
10. Sketch the relationship between recursive least squares and the Kalman filter in one or two sentences.

## Connections

- **Builds on:** general programming comfort and basic trigonometry — there are no formal curriculum prerequisites for this topic.
- **Feeds into:** [Calculus for the Modern Engineer](../calculus-robotics/learn) (continuous optimization runs on this matrix machinery), [Rigid Body Kinematics & Manipulators](../rigid-body-kinematics/learn) (forward/inverse kinematics, Jacobians, and singularities are direct applications of SO(3)/SE(3) and SVD), [Mobile Robotics & SLAM](../mobile-robotics-slam/learn) (Kalman filters and pose-graph optimization are linear algebra all the way down), [Perception & Computer Vision](../perception-computer-vision/learn) (camera calibration and visual odometry use the same homogeneous transforms and SVD-based alignment).
