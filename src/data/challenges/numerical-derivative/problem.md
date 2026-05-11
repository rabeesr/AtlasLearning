# Angular Velocity From Encoder Samples

A motor encoder reports the joint angle `theta(t)` at discrete times. To run a velocity controller, you need the **instantaneous angular velocity** `omega = d theta / dt`. There is no analytic expression for `theta` — only the samples — so you estimate the derivative numerically.

The cheapest second-order-accurate option is the **central difference**:

```
theta'(t) ~ (theta(t + h) - theta(t - h)) / (2 h)
```

Same recipe applies to any sensor: gyro-derived angular acceleration from rate, accelerometer-derived jerk from acceleration, and gradient estimates inside a learned policy.

## Task

Implement `derivative(f, x, h=1e-5)` returning an estimate of `f'(x)` using the central difference formula above.

## Inputs

- `f` — a callable `float -> float`. Think of it as `theta(t)`: returns angle (rad) at time `t` (s).
- `x` — a `float`. The time at which you want the angular velocity.
- `h` — step size (default `1e-5`).

## Output

- A `float` estimate of `f'(x)`. Units: if `f` is angle (rad) and `x` is time (s), the answer is in rad/s.

## Worked example

```python
import math
# theta(t) = sin(t) -> omega(t) = cos(t)
derivative(math.sin, 0.0)         # -> ~1.0 rad/s
derivative(lambda t: t**3, 2.0)   # -> ~12.0 (analytic: 3 * 2^2 = 12)
```

## Tests you'll be graded against

- `test_constant_angular_velocity` — theta(t) = sin(t) at t=0; expect omega = 1.
- `test_decelerating_joint` — theta(t) = cos(t) at t = pi/2; expect omega = -1.
- `test_exponential_motion_profile` — exp(t) at t = 1.5 must be within 1e-4 of e^1.5.
- `test_cubic_position_profile` — t^3 at t=2 must give 12 to high precision.
- `test_step_size_argument_is_used` — central difference is exact on quadratics, so h=1e-2 on (2t^2 + t) at t=3 must give 13 to machine precision.

## What to watch out for

- **Don't reach for SymPy or autograd.** One line of arithmetic.
- **`h` is a tradeoff.** Truncation error is O(h^2); cancellation error grows like `eps_machine / h`. Around `h = 1e-5` is the sweet spot for `float64`. Smaller is worse, not better.
- **Order matters for sign.** Make sure you compute `(f(x + h) - f(x - h)) / (2 h)`, not `(f(x - h) - f(x + h)) / (2 h)`.
