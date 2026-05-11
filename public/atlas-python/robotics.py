"""
robotics.py — Atlas Learning teaching shim.

Small, well-commented helpers for transforms, kinematics, and basic control.
This is intentionally tiny — it's a teaching aid, NOT a production lib.

All functions return numpy arrays. Angles are radians unless stated otherwise.
"""

from __future__ import annotations

import math
from typing import Iterable, Tuple

import numpy as np


# ---------------------------------------------------------------------------
# Rotations
# ---------------------------------------------------------------------------

def rot_x(theta: float) -> np.ndarray:
    """Rotation matrix about the X axis (radians)."""
    c, s = math.cos(theta), math.sin(theta)
    return np.array([
        [1, 0, 0],
        [0, c, -s],
        [0, s, c],
    ], dtype=float)


def rot_y(theta: float) -> np.ndarray:
    """Rotation matrix about the Y axis (radians)."""
    c, s = math.cos(theta), math.sin(theta)
    return np.array([
        [c, 0, s],
        [0, 1, 0],
        [-s, 0, c],
    ], dtype=float)


def rot_z(theta: float) -> np.ndarray:
    """Rotation matrix about the Z axis (radians)."""
    c, s = math.cos(theta), math.sin(theta)
    return np.array([
        [c, -s, 0],
        [s, c, 0],
        [0, 0, 1],
    ], dtype=float)


# ---------------------------------------------------------------------------
# Homogeneous transforms (SE(3))
# ---------------------------------------------------------------------------

def homogeneous(R: np.ndarray, t: Iterable[float]) -> np.ndarray:
    """Build a 4x4 homogeneous transform from rotation R (3x3) and translation t (3,)."""
    R = np.asarray(R, dtype=float)
    t = np.asarray(list(t), dtype=float)
    if R.shape != (3, 3):
        raise ValueError(f"R must be 3x3, got {R.shape}")
    if t.shape != (3,):
        raise ValueError(f"t must have shape (3,), got {t.shape}")
    H = np.eye(4)
    H[:3, :3] = R
    H[:3, 3] = t
    return H


def invert_transform(H: np.ndarray) -> np.ndarray:
    """Invert a 4x4 homogeneous transform efficiently (transpose of R, then -R^T t)."""
    H = np.asarray(H, dtype=float)
    R = H[:3, :3]
    t = H[:3, 3]
    Hi = np.eye(4)
    Hi[:3, :3] = R.T
    Hi[:3, 3] = -R.T @ t
    return Hi


def compose(*transforms: np.ndarray) -> np.ndarray:
    """Compose any number of 4x4 transforms left-to-right (T1 @ T2 @ ... @ Tn)."""
    out = np.eye(4)
    for T in transforms:
        out = out @ np.asarray(T, dtype=float)
    return out


# ---------------------------------------------------------------------------
# Skew / cross-product matrix
# ---------------------------------------------------------------------------

def skew(v: Iterable[float]) -> np.ndarray:
    """Skew-symmetric matrix for a 3-vector v. skew(v) @ w == cross(v, w)."""
    v = np.asarray(list(v), dtype=float)
    if v.shape != (3,):
        raise ValueError(f"skew expects a 3-vector, got shape {v.shape}")
    x, y, z = v
    return np.array([
        [0, -z, y],
        [z, 0, -x],
        [-y, x, 0],
    ], dtype=float)


# ---------------------------------------------------------------------------
# Small PID helper
# ---------------------------------------------------------------------------

class PID:
    """Textbook PID controller. step(error, dt) -> control output."""

    def __init__(self, kp: float, ki: float, kd: float, i_clamp: float | None = None):
        self.kp = kp
        self.ki = ki
        self.kd = kd
        self.i_clamp = i_clamp
        self._integral = 0.0
        self._last_error: float | None = None

    def reset(self) -> None:
        self._integral = 0.0
        self._last_error = None

    def step(self, error: float, dt: float) -> float:
        if dt <= 0:
            raise ValueError("dt must be positive")
        self._integral += error * dt
        if self.i_clamp is not None:
            self._integral = max(-self.i_clamp, min(self.i_clamp, self._integral))
        derivative = 0.0 if self._last_error is None else (error - self._last_error) / dt
        self._last_error = error
        return self.kp * error + self.ki * self._integral + self.kd * derivative


# ---------------------------------------------------------------------------
# Convenience exports
# ---------------------------------------------------------------------------

__all__ = [
    "rot_x", "rot_y", "rot_z",
    "homogeneous", "invert_transform", "compose",
    "skew",
    "PID",
]
