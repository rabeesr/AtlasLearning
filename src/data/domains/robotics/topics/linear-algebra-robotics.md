---
title: "Computational Linear Algebra"
summary: "Linear algebra learned computationally — as a way to handle data, not as a parade of determinants."
learning_objectives:
  - "Implement matrix and vector operations from scratch."
  - "Solve systems of linear equations numerically."
  - "Build a least-squares fitter and use it for sensor calibration."
  - "Reason about eigenvalues, eigenvectors, and their robotics applications."
estimated_minutes: 480
---

# Why this topic matters

Robotics is full of quantities that live in space: positions, velocities, orientations, sensor frames, and transforms between them. Linear algebra is the language for those quantities. **Learn it computationally** — write the algorithms in code, not just on paper. This habit compounds: state estimation, kinematics, optimization, and perception are all built on the same primitives.

## Deep-dive subtopics

- **Matrix & vector operations.** Implement `dot`, `matmul`, `transpose`, `inverse` from scratch.
- **Systems of linear equations.** Gaussian elimination with partial pivoting; LU decomposition; numerical conditioning.
- **Eigenvalues and eigenvectors.** Power iteration, the QR algorithm, principal component analysis.
- **Least squares optimization.** The normal equations, when they fail, and how to use them for sensor calibration and regression.

## What comes next

This topic feeds forward kinematics, state estimation (Kalman filters, EKF), optimization for SLAM, and the abstract linear algebra in Phase 3.
