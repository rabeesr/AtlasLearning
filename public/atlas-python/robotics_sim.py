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
