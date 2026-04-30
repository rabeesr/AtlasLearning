---
title: "Rigid Body Kinematics & Manipulators"
summary: "Robotic arms — forward and inverse kinematics, Jacobians, and manipulator dynamics."
learning_objectives:
  - "Compose homogeneous transforms across a kinematic chain."
  - "Solve inverse kinematics analytically and numerically."
  - "Compute Jacobians and detect singularities."
  - "Derive equations of motion using Newton-Euler."
estimated_minutes: 480
---

# Why this topic matters

Mobile robots are only half of the field. Manipulators — robotic arms — are the other half, and they require their own math. Forward kinematics tells you where the end-effector is given the joint angles. Inverse kinematics tells you what joint angles achieve a desired pose. Jacobians let you reason about velocities. Dynamics tell you what torque to command.

## Deep-dive subtopics

- **Forward kinematics.** Composing transforms; Denavit-Hartenberg parameters.
- **Inverse kinematics.** Closed-form for some chains; numeric (damped least squares) in general.
- **Jacobians.** Joint to spatial velocity; manipulability; singularity detection.
- **Manipulator dynamics.** Newton-Euler recursion; computing required joint torques.

## What comes next

Manipulator kinematics combines with ROS 2 to give you full simulation-driven manipulator development.
