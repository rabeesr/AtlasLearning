# Drive a Two-Link Planar Arm Along a Joint-Velocity Profile

You're commanding a planar 2-link robot arm — two rigid links of lengths
`L1` and `L2`, joined at the shoulder and elbow. The motion planner has
handed you a *joint-velocity profile* sampled at uniform time steps:
`qdot_history[i]` is the pair `(theta1_dot, theta2_dot)` in **rad/s** at
time `t_i = i * dt`. Starting from rest at home configuration
`q0 = (theta1_0, theta2_0)` rad, you need to:

1. **Integrate the velocity profile** (calculus) to recover the joint
   angles `q[i]` at each time step.
2. **Apply forward kinematics** (kinematics) to map joint angles to the
   end-effector position `(x, y)` in the world frame.

The autograder then sweeps your two functions through a few canned
profiles and checks the resulting trajectory against the analytical
answer. The reference solution also feeds your joint history into
`robotics_sim.animate_arm_2d(...)` so you can *see* your arm move.

## Function signatures

```python
def integrate_joint_velocity(qdot_history, dt, q0):
    """
    Trapezoidal integration of joint velocities.

    Parameters
    ----------
    qdot_history : ndarray of shape (N, 2)
        Joint velocities (rad/s) sampled at t_i = i * dt.
    dt : float
        Step size in seconds. Strictly positive.
    q0 : array-like of length 2
        Initial joint angles (rad).

    Returns
    -------
    q_history : ndarray of shape (N, 2)
        Joint angles (rad) at each time step. q_history[0] == q0.
    """


def forward_kinematics(q, link_lengths):
    """
    Forward kinematics for a planar 2-link arm.

    Parameters
    ----------
    q : array-like of length 2
        (theta1, theta2) in radians.
        theta1 measured from +x axis, theta2 relative to link 1.
    link_lengths : array-like of length 2
        (L1, L2) in meters.

    Returns
    -------
    (x, y) : tuple of float
        End-effector position in meters, world frame.
    """
```

## Worked example

With `L1 = 1.0`, `L2 = 0.5`, `q = (0, 0)` (arm straight along +x axis):

```
forward_kinematics((0.0, 0.0), (1.0, 0.5))  ->  (1.5, 0.0)
```

With `q = (pi/2, 0)` (arm pointing straight up):

```
forward_kinematics((np.pi/2, 0.0), (1.0, 0.5))  ->  (0.0, 1.5)
```

Trapezoidal integration of a constant velocity `qdot = (1.0, 0.0)` rad/s
over `dt = 0.1` for `N = 11` samples starting from `q0 = (0, 0)` should
produce `q[10] ≈ (1.0, 0.0)` rad — one radian on joint 1, no motion on
joint 2.

## Tests

| Name | What it checks |
|---|---|
| `test_initial_angle_preserved` | `q_history[0]` equals `q0` |
| `test_zero_velocity_arm_static` | Zero velocity → arm doesn't move |
| `test_constant_velocity_linear_angle` | Constant `qdot` → angles grow linearly |
| `test_fk_home_pose` | FK of `(0, 0)` is `(L1+L2, 0)` |
| `test_fk_straight_up` | FK of `(pi/2, 0)` is `(0, L1+L2)` |
| `test_fk_elbow_bent` | FK of `(0, pi/2)` is `(L1, L2)` |
| `test_end_to_end_trajectory` | Integrated profile + FK matches analytical endpoint |

## What to watch out for

- **Trapezoidal rule, not Euler.** The trapezoidal rule averages the
  velocity at consecutive samples: `q[i+1] = q[i] + dt/2 * (qdot[i] + qdot[i+1])`.
  This is what eliminates the drift you'd see with naive forward Euler
  on a non-constant velocity.
- **Joint angle conventions.** `theta1` is the shoulder angle measured
  from the world `+x` axis. `theta2` is the *relative* elbow angle — the
  elbow link's angle relative to the upper link, **not** relative to the
  world. The world-frame angle of link 2 is therefore `theta1 + theta2`.
- **Vectorize but keep it readable.** Numpy will make this fast, but
  loops are fine here — the autograder runs in well under a second.
- **Units.** All angles in radians, all lengths in meters, all times in
  seconds. Mixing degrees in will silently fail the tests.
