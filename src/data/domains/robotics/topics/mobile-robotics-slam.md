---
title: "Mobile Robotics & SLAM"
summary: "Probabilistic state estimation for mobile robots: where am I, what does the world look like, and how do I get there?"
learning_objectives:
  - "Implement Bayesian filtering by hand."
  - "Build an Extended Kalman Filter for localization."
  - "Reason about Lie groups (SO(3), SE(3))."
  - "Build a SLAM system end-to-end."
estimated_minutes: 600
---

# Why this topic matters

Real-world robots operate in noisy, partially-observable environments. SLAM (Simultaneous Localization and Mapping) is the canonical problem of mobile autonomy: a robot enters an unknown environment, builds a map, and pinpoints its own location within that growing map.

## Deep-dive subtopics

- **Bayesian filtering.** Prior, likelihood, posterior, recursive Bayes.
- **State estimation.** Kalman filter, EKF, Invariant EKF, particle filters.
- **Lie groups.** SO(3) and SE(3); the exponential map.
- **Mapping & localization.** Occupancy grid mapping from LIDAR; feature-based localization.
- **Full SLAM.** Front-ends, back-ends, loop closure.

## What comes next

SLAM combines with ROS 2 and the perception topic to deliver complete autonomous-navigation stacks.
