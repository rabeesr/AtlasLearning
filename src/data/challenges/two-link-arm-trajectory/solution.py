import numpy as np


def integrate_joint_velocity(qdot_history, dt, q0):
    qdot = np.asarray(qdot_history, dtype=float)
    n = qdot.shape[0]
    q = np.empty_like(qdot)
    q[0] = np.asarray(q0, dtype=float)
    # Trapezoidal rule: q[i+1] = q[i] + dt/2 * (qdot[i] + qdot[i+1]).
    # Averaging consecutive velocities removes the first-order bias
    # that naive forward Euler would accumulate over time.
    print(f"[integrate] N={n}, dt={dt}, q0={q[0]}")
    for i in range(n - 1):
        q[i + 1] = q[i] + 0.5 * dt * (qdot[i] + qdot[i + 1])
    print(f"[integrate] q[end]={q[-1]}")
    return q


def forward_kinematics(q, link_lengths):
    theta1, theta2 = float(q[0]), float(q[1])
    L1, L2 = float(link_lengths[0]), float(link_lengths[1])
    # Link 2 is described by the absolute world-frame angle theta1+theta2,
    # since theta2 is defined relative to link 1.
    x = L1 * np.cos(theta1) + L2 * np.cos(theta1 + theta2)
    y = L1 * np.sin(theta1) + L2 * np.sin(theta1 + theta2)
    print(f"[FK] q=({theta1:.4f}, {theta2:.4f}) -> (x, y)=({x:.4f}, {y:.4f})")
    return (x, y)


# -----------------------------------------------------------------------
# Demo — runs when the example solution is revealed and executed.
# Generates an animated arm sweeping a sinusoidal joint-velocity profile
# and visualises it via robotics_sim.animate_arm_2d.
# -----------------------------------------------------------------------
try:
    import robotics_sim  # provided by the AtlasLearning runner

    def _demo_arm_trajectory():
        dt = 0.04
        T = 4.0
        n = int(T / dt) + 1
        t = np.linspace(0.0, T, n)

        # Joint 1 sweeps from 0 to ~pi/2; joint 2 oscillates around -pi/4.
        qdot = np.column_stack([
            (np.pi / 2 / T) * np.ones_like(t),
            (-np.pi / 6) * np.cos(2 * np.pi * t / T),
        ])
        q0 = np.array([0.0, -np.pi / 4])

        q_hist = integrate_joint_velocity(qdot, dt, q0)
        end_pose = forward_kinematics(q_hist[-1], (1.0, 0.6))
        print(f"[demo] final end-effector: {end_pose}")
        return robotics_sim.animate_arm_2d(q_hist, (1.0, 0.6))

    _demo_arm_trajectory()
except Exception as _exc:  # noqa: BLE001
    # Tests don't need the animation — only the reveal-solution path does.
    print(f"[demo] skipped: {_exc}")
