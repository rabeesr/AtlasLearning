"""robotics_sim — small matplotlib-animation helpers for AtlasLearning.

Educational module that renders three common planar robotics visualizations
as matplotlib FuncAnimations. The Pyodide worker tracks every FuncAnimation
that user code constructs, replays each frame, and ships the frames to the
browser as base64 PNGs (see src/lib/pyodide/pyodide-worker.ts).

Helpers all return the FuncAnimation. Returning it is sufficient — the worker
captures from construction, so you do not need to keep the variable alive or
call plt.show().

Conventions:
- All angles in radians.
- All lengths in metres.
- Axes are set to equal aspect ratio so circles look circular.

Example
-------
>>> import numpy as np
>>> import robotics_sim
>>> t  = np.linspace(0, 6, 120)
>>> theta = 0.5 * np.cos(2.0 * t)
>>> anim = robotics_sim.animate_pendulum(theta, dt=t[1] - t[0], length=1.0)
"""

from __future__ import annotations

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.animation as _mpl_anim

# NOTE: we resolve `FuncAnimation` at call time (not import time) so the
# AtlasLearning Pyodide worker's tracked-animation subclass — installed
# via `matplotlib.animation.FuncAnimation = _AtlasTrackedFuncAnimation`
# in setupRunEnv — is the one we instantiate. A top-level
# `from matplotlib.animation import FuncAnimation` would bind the
# original class at module import (init time) and bypass tracking.


def _interval_from_dt(dt: float) -> int:
    """Convert a sim timestep (s) into a matplotlib interval (ms), clamped."""
    interval_ms = int(round(1000.0 * float(dt)))
    return max(16, min(500, interval_ms))


def animate_pendulum(theta_history, dt, length: float = 1.0):
    """Animate a simple pendulum given theta(t) samples.

    Parameters
    ----------
    theta_history : array-like, shape (N,)
        Angle of the pendulum from the downward vertical, in radians,
        sampled at uniform timestep `dt`.
    dt : float
        Sample period in seconds. Sets the animation framerate.
    length : float, default 1.0
        Pendulum rod length in metres.

    Returns
    -------
    FuncAnimation
        The animation object — tracked by the Pyodide worker.
    """
    theta = np.asarray(theta_history, dtype=float).ravel()
    n = theta.shape[0]
    L = float(length)

    fig, ax = plt.subplots(figsize=(4, 4))
    pad = 0.2 * L
    ax.set_xlim(-L - pad, L + pad)
    ax.set_ylim(-L - pad, L + pad)
    ax.set_aspect("equal")
    ax.set_title("Pendulum")
    ax.set_xlabel("x [m]")
    ax.set_ylabel("y [m]")

    # Pivot, rod, bob.
    ax.plot([0.0], [0.0], "o", color="#0066CC", markersize=6)
    (rod,) = ax.plot([], [], lw=2, color="#1D1D1F")
    (bob,) = ax.plot([], [], "o", color="#0066CC", markersize=14)

    def update(i: int):
        # Standard pendulum geometry: theta measured from -y axis.
        x = L * np.sin(theta[i])
        y = -L * np.cos(theta[i])
        rod.set_data([0.0, x], [0.0, y])
        bob.set_data([x], [y])
        return rod, bob

    # Draw frame 0 immediately so the figure is non-empty even before the
    # animation runs (matters for static-fallback captures).
    update(0)
    interval = _interval_from_dt(dt)
    return _mpl_anim.FuncAnimation(fig, update, frames=n, interval=interval, blit=False)


def animate_trajectory_2d(positions, fps: int = 30):
    """Animate a moving point with a trailing path in 2D.

    Parameters
    ----------
    positions : array-like, shape (N, 2)
        Sequence of (x, y) positions in metres.
    fps : int, default 30
        Playback rate. Sets the animation interval to 1000 / fps ms.

    Returns
    -------
    FuncAnimation
    """
    pos = np.asarray(positions, dtype=float)
    if pos.ndim != 2 or pos.shape[1] != 2:
        raise ValueError("positions must have shape (N, 2)")
    n = pos.shape[0]

    fig, ax = plt.subplots(figsize=(4.5, 4))
    margin = 0.1 * max(1e-6, float(np.ptp(pos)))
    ax.set_xlim(float(pos[:, 0].min()) - margin, float(pos[:, 0].max()) + margin)
    ax.set_ylim(float(pos[:, 1].min()) - margin, float(pos[:, 1].max()) + margin)
    ax.set_aspect("equal")
    ax.set_title("Trajectory")
    ax.set_xlabel("x [m]")
    ax.set_ylabel("y [m]")

    (trail,) = ax.plot([], [], lw=1.5, color="#0066CC", alpha=0.6)
    (head,) = ax.plot([], [], "o", color="#0066CC", markersize=8)

    def update(i: int):
        trail.set_data(pos[: i + 1, 0], pos[: i + 1, 1])
        head.set_data([pos[i, 0]], [pos[i, 1]])
        return trail, head

    update(0)
    interval = max(16, int(round(1000.0 / float(max(1, fps)))))
    return _mpl_anim.FuncAnimation(fig, update, frames=n, interval=interval, blit=False)


def animate_arm_2d(joint_angles_history, link_lengths):
    """Animate a planar K-link arm via forward kinematics.

    Parameters
    ----------
    joint_angles_history : array-like, shape (N, K)
        Joint angles in radians at each timestep. Angles are absolute
        (cumulative) — joint k's link points at angle theta_k from +x.
    link_lengths : array-like, shape (K,)
        Lengths of each link in metres.

    Returns
    -------
    FuncAnimation
    """
    theta = np.asarray(joint_angles_history, dtype=float)
    L = np.asarray(link_lengths, dtype=float).ravel()
    if theta.ndim != 2:
        raise ValueError("joint_angles_history must be 2D (N, K)")
    n, k = theta.shape
    if L.shape[0] != k:
        raise ValueError("link_lengths length must match number of joints K")

    reach = float(L.sum())
    pad = 0.15 * reach + 1e-6

    fig, ax = plt.subplots(figsize=(4.5, 4.5))
    ax.set_xlim(-reach - pad, reach + pad)
    ax.set_ylim(-reach - pad, reach + pad)
    ax.set_aspect("equal")
    ax.set_title("Planar arm")
    ax.set_xlabel("x [m]")
    ax.set_ylabel("y [m]")

    (arm,) = ax.plot([], [], "-o", lw=2.5, color="#1D1D1F", markersize=6)
    (ee,) = ax.plot([], [], "o", color="#0066CC", markersize=10)

    def forward(angles: np.ndarray):
        # Cumulative absolute-angle FK: joint k pose follows joint k-1.
        xs = [0.0]
        ys = [0.0]
        for i in range(k):
            xs.append(xs[-1] + float(L[i]) * np.cos(angles[i]))
            ys.append(ys[-1] + float(L[i]) * np.sin(angles[i]))
        return xs, ys

    def update(i: int):
        xs, ys = forward(theta[i])
        arm.set_data(xs, ys)
        ee.set_data([xs[-1]], [ys[-1]])
        return arm, ee

    update(0)
    return _mpl_anim.FuncAnimation(fig, update, frames=n, interval=50, blit=False)


# ----------------------------------------------------------------------------
# Planar 2-link arm reach playground
# ----------------------------------------------------------------------------


def simulate_arm_reach(
    step_fn,
    target_xy=(1.0, 0.5),
    link_lengths=(1.0, 0.8),
    duration=6.0,
    noise=0.0,
    dt=0.04,
    init_joints=(0.5, 0.5),
    reach_tol=0.05,
):
    """Simulate a planar 2-link arm controlled by a user policy.

    The user's `step_fn` is called once per timestep with the (noisy) joint
    state and the target. It must return commanded joint velocities. Joints
    are then integrated kinematically (no dynamics) and the end-effector is
    traced in 2D via the cumulative-absolute-angle forward kinematics used
    by `animate_arm_2d`.

    step_fn signature:
        step(joints, joint_vels, target_xy, t) -> joint_vels_command

    Parameters
    ----------
    step_fn : callable
        See signature above. Returns array-like length K (joint vel cmds).
    target_xy : tuple (x, y)
        Target end-effector position in metres.
    link_lengths : tuple of floats
        Length of each link in metres. Default (1.0, 0.8) — total reach 1.8 m.
    duration : float
        Sim length in seconds.
    noise : float
        Gaussian σ on observed joint angles (rad). Position observations are
        noised at the same scale.
    dt : float
        Integration timestep [s]. 0.04 → 25 frames/sec.
    init_joints : tuple of floats
        Initial joint angles [rad]. Default (0.5, 0.5).
    reach_tol : float
        Distance [m] at which the target is considered "reached" — at which
        point the target marker turns green for the rest of the run.

    Returns
    -------
    FuncAnimation
        The animation object — tracked by the Pyodide worker.
    """
    L = np.asarray(link_lengths, dtype=float).ravel()
    K = L.shape[0]
    target = np.asarray(target_xy, dtype=float).ravel()
    if target.shape[0] != 2:
        raise ValueError("target_xy must be (x, y)")
    joints = np.asarray(init_joints, dtype=float).ravel().copy()
    if joints.shape[0] != K:
        raise ValueError("init_joints length must match link_lengths")
    joint_vels = np.zeros(K, dtype=float)

    n_steps = max(1, int(round(float(duration) / float(dt))))

    # History buffers.
    joints_hist = np.zeros((n_steps + 1, K))
    ee_hist = np.zeros((n_steps + 1, 2))
    joints_hist[0] = joints
    rng = np.random.default_rng(0)

    def _forward(angs):
        """Cumulative-absolute-angle FK. Returns (xs, ys) lists of length K+1."""
        xs = [0.0]
        ys = [0.0]
        for i in range(K):
            xs.append(xs[-1] + float(L[i]) * np.cos(angs[i]))
            ys.append(ys[-1] + float(L[i]) * np.sin(angs[i]))
        return xs, ys

    xs0, ys0 = _forward(joints)
    ee_hist[0] = (xs0[-1], ys0[-1])
    reached_at = -1

    for i in range(n_steps):
        t = i * dt
        # Noisy observation of joints + joint velocities.
        obs_joints = joints + (rng.normal(0.0, noise, size=K) if noise > 0 else 0.0)
        obs_vels = joint_vels.copy()
        try:
            cmd = step_fn(obs_joints, obs_vels, tuple(target), t)
        except Exception as exc:
            raise RuntimeError(
                f"step_fn raised at t={t:.3f}s: {type(exc).__name__}: {exc}"
            ) from exc
        cmd_arr = np.asarray(cmd, dtype=float).ravel()
        if cmd_arr.shape[0] != K:
            raise ValueError(
                f"step_fn must return {K} commands; got shape {cmd_arr.shape}"
            )
        # Clip joint vels to keep motion physically plausible.
        cmd_arr = np.clip(cmd_arr, -8.0, 8.0)
        joint_vels = cmd_arr
        joints = joints + dt * joint_vels
        joints_hist[i + 1] = joints
        xs, ys = _forward(joints)
        ee_hist[i + 1] = (xs[-1], ys[-1])
        if reached_at < 0:
            if np.linalg.norm(ee_hist[i + 1] - target) <= reach_tol:
                reached_at = i + 1

    # ----- Figure & artists ------------------------------------------------
    reach = float(L.sum())
    pad = 0.2 * reach + 1e-6
    fig, ax = plt.subplots(figsize=(5.0, 5.0))
    ax.set_xlim(-reach - pad, reach + pad)
    ax.set_ylim(-reach - pad, reach + pad)
    ax.set_aspect("equal")
    ax.set_title("Planar arm reach")
    ax.set_xlabel("x [m]")
    ax.set_ylabel("y [m]")

    # Workspace ring (max reach) — drawn faintly to give the eye a frame.
    angles = np.linspace(0.0, 2.0 * np.pi, 128)
    ax.plot(
        reach * np.cos(angles),
        reach * np.sin(angles),
        color="#D2D2D7",
        lw=1,
        zorder=1,
    )

    # Static target marker — color flips when reach is achieved.
    (target_dot,) = ax.plot(
        [float(target[0])], [float(target[1])],
        marker="o", markersize=14, markerfacecolor="none",
        markeredgewidth=2.5, markeredgecolor="#0066CC", zorder=2,
    )

    # Arm + end-effector + fading trail.
    (arm,) = ax.plot([], [], "-o", lw=3.0, color="#1D1D1F", markersize=6, zorder=4)
    (ee,) = ax.plot([], [], "o", color="#0066CC", markersize=10, zorder=5)
    TRAIL_LEN = 30
    trail_lines = []
    for k in range(TRAIL_LEN):
        alpha = (k + 1) / TRAIL_LEN * 0.6
        (ln,) = ax.plot([], [], "-", lw=1.5, color="#0066CC", alpha=alpha, zorder=3)
        trail_lines.append(ln)

    hud = ax.text(
        0.02, 0.96,
        "", transform=ax.transAxes,
        fontsize=10, family="monospace",
        color="#6E6E73", verticalalignment="top",
    )

    def update(i: int):
        ang = joints_hist[i]
        xs, ys = _forward(ang)
        arm.set_data(xs, ys)
        ee.set_data([xs[-1]], [ys[-1]])

        # Fading trail: last TRAIL_LEN frames of the end-effector path.
        start = max(0, i - TRAIL_LEN)
        recent = ee_hist[start : i + 1]
        for k, ln in enumerate(trail_lines):
            seg_i = len(recent) - 1 - k
            if seg_i > 0:
                ln.set_data(
                    recent[seg_i - 1 : seg_i + 1, 0],
                    recent[seg_i - 1 : seg_i + 1, 1],
                )
            else:
                ln.set_data([], [])

        # Target flips green once reached.
        if reached_at >= 0 and i >= reached_at:
            target_dot.set_markeredgecolor("#34C759")
            target_dot.set_markerfacecolor("#34C759")
        else:
            target_dot.set_markeredgecolor("#0066CC")
            target_dot.set_markerfacecolor("none")

        err = float(np.linalg.norm(ee_hist[i] - target))
        hud.set_text(
            f"t={i * dt:5.2f}s  ee=({ee_hist[i, 0]:+.2f}, {ee_hist[i, 1]:+.2f})  err={err:.3f}m"
        )
        return (arm, ee, target_dot, hud, *trail_lines)

    update(0)
    interval = _interval_from_dt(dt)
    return _mpl_anim.FuncAnimation(
        fig, update, frames=n_steps + 1, interval=interval, blit=False
    )
