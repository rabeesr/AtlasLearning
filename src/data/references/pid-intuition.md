# PID intuition

PID is the workhorse feedback controller in robotics. You will use it before you have any plant model, and you will keep using it after you have one. This page is the intuition, not the math.

## What each term *means*

For an error \(e(t) = \text{target} - \text{measurement}\):

- **P (proportional)** — present error. Big error → big push. Too much P and the system overshoots and rings.
- **I (integral)** — past error. Eliminates steady-state offsets caused by gravity, friction, or model bias. Too much I and the response gets sluggish and oscillatory at a slower frequency than the P ringing.
- **D (derivative)** — predicted error (rate of approach). Damps the P-driven overshoot. Too much D amplifies sensor noise into actuator chatter.

## Tuning heuristic (Ziegler–Nichols, the "good enough" way)

1. Set \(I = D = 0\).
2. Crank P up until the system oscillates with sustained amplitude. Call that gain \(K_u\) and the period \(T_u\).
3. Use \(P = 0.6 K_u\), \(I = 1.2 K_u / T_u\), \(D = 0.075 K_u T_u\). Then back off if it feels too aggressive.

For balancing tasks (cart-pole, two-wheeled inverted pendulum), you can often get away with PD on the angle alone. The integral term causes problems for unstable plants — you wind up integrating an error that is changing sign rapidly.

## Common failure modes

- **Integral windup**: error stays large because of an actuator limit; the integral accumulates a huge value and overshoots wildly when the limit clears. Fix: clamp the integral, or only accumulate when the actuator is not saturated.
- **Derivative kick**: a step change in the target produces an infinite derivative for one timestep. Fix: compute the derivative of the *measurement*, not the error. \(D \cdot \dot e \to -D \cdot \dot y\).
- **Sampling chatter**: D term computed as a finite difference of a noisy signal is mostly noise. Fix: low-pass filter the measurement before differentiating, or use a state observer.

## When PID is the wrong answer

- Plants with significant transport delay (transport > 0.5 × dominant time constant) — Smith predictor or model-based control.
- Multi-input/multi-output systems where outputs interact — LQR or MPC give you cross-axis terms PID can't express.
- Trajectory tracking with known dynamics — feed-forward (compute inverse dynamics for the desired motion) plus PID on the residual error is far better than PID alone.

## What to keep on a sticky note

- P alone → permanent steady-state error.
- PD → fast, no ringing, sensitive to sensor noise.
- PI → no steady-state error, slow.
- PID → balanced, the most common starting point. Tune in that order: P first, then D, then a small I.
