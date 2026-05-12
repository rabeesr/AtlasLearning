import numpy as np


def test_initial_angle_preserved():
    # The first row of q_history must equal q0 exactly — the integrator
    # should never advance past the seed value.
    qdot = np.zeros((5, 2))
    q = integrate_joint_velocity(qdot, 0.1, (0.3, -0.2))
    assert q.shape == (5, 2), f"expected shape (5, 2), got {q.shape}"
    assert abs(q[0, 0] - 0.3) < 1e-12, f"q[0, 0] drifted: got {q[0, 0]}"
    assert abs(q[0, 1] - (-0.2)) < 1e-12, f"q[0, 1] drifted: got {q[0, 1]}"


def test_zero_velocity_arm_static():
    # Zero velocity should leave joint angles unchanged everywhere.
    qdot = np.zeros((20, 2))
    q = integrate_joint_velocity(qdot, 0.05, (0.5, 0.7))
    err = float(np.max(np.abs(q - np.array([0.5, 0.7]))))
    assert err < 1e-12, f"zero qdot moved the arm; max error {err}"


def test_constant_velocity_linear_angle():
    # qdot = (1.0, 0.0) rad/s for 1.0 s -> q increases by 1.0 rad on joint 1.
    dt = 0.1
    n = 11
    qdot = np.tile(np.array([1.0, 0.0]), (n, 1))
    q = integrate_joint_velocity(qdot, dt, (0.0, 0.0))
    assert abs(q[-1, 0] - 1.0) < 1e-9, (
        f"after 1.0 s at 1.0 rad/s, joint 1 should be 1.0 rad; got {q[-1, 0]}"
    )
    assert abs(q[-1, 1] - 0.0) < 1e-12, (
        f"joint 2 had zero velocity but moved to {q[-1, 1]}"
    )


def test_fk_home_pose():
    # Arm fully extended along +x.
    x, y = forward_kinematics((0.0, 0.0), (1.0, 0.5))
    assert abs(x - 1.5) < 1e-9, f"home x should be L1+L2=1.5; got {x}"
    assert abs(y - 0.0) < 1e-9, f"home y should be 0; got {y}"


def test_fk_straight_up():
    # Shoulder rotated 90 deg, elbow straight -> end-effector at (0, L1+L2).
    x, y = forward_kinematics((np.pi / 2, 0.0), (1.0, 0.5))
    assert abs(x - 0.0) < 1e-9, f"x should be 0; got {x}"
    assert abs(y - 1.5) < 1e-9, f"y should be L1+L2=1.5; got {y}"


def test_fk_elbow_bent():
    # Shoulder at 0, elbow rotated 90 deg -> link 2 points up from (L1, 0).
    x, y = forward_kinematics((0.0, np.pi / 2), (1.0, 0.5))
    assert abs(x - 1.0) < 1e-9, f"x should be L1=1.0; got {x}"
    assert abs(y - 0.5) < 1e-9, f"y should be L2=0.5; got {y}"


def test_end_to_end_trajectory():
    # Constant velocity profile (pi/2, 0) for 1.0 s rotates shoulder to pi/2.
    # Final FK should land at (0, L1+L2).
    dt = 0.01
    n = 101
    qdot = np.tile(np.array([np.pi / 2, 0.0]), (n, 1))
    q_hist = integrate_joint_velocity(qdot, dt, (0.0, 0.0))
    x, y = forward_kinematics(q_hist[-1], (1.0, 0.5))
    assert abs(x - 0.0) < 1e-6, f"final x should be ~0; got {x}"
    assert abs(y - 1.5) < 1e-6, f"final y should be ~1.5; got {y}"
