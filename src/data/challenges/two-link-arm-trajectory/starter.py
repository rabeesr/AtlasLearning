import numpy as np


def integrate_joint_velocity(qdot_history, dt, q0):
    """Integrate joint velocity samples into joint angles via the
    trapezoidal rule. See problem.md for full signature."""
    raise NotImplementedError("integrate_joint_velocity is not implemented yet")


def forward_kinematics(q, link_lengths):
    """Forward kinematics of a planar 2-link arm. Returns the end-effector
    (x, y) in the world frame. See problem.md for full signature."""
    raise NotImplementedError("forward_kinematics is not implemented yet")
