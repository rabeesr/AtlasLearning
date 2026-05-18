# Python idioms for control loops

Robotics simulators in Python tend to look the same: an outer loop over time, a state vector, an integrator step, and a controller call. A few idioms keep the code readable and avoid common bugs.

## State as a NumPy array, not a tuple of floats

```python
state = np.array([0.0, 0.0, 0.05, 0.0])
```

You can write vectorized math (`state + dt * deriv`) and slice into named components. The cost is that you cannot use tuple-unpacking on the right-hand side without flattening (`x, x_dot, theta, theta_dot = state` works because NumPy arrays are iterable, but `(a, b) + (c, d)` would have concatenated tuples — be deliberate).

## Closing over scenario constants

If your controller needs constants (target, gains), pass them through a closure rather than module-level globals:

```python
def make_controller(target, kp, kd):
    def step(state, t):
        x, x_dot, theta, theta_dot = state
        return -kp * theta - kd * theta_dot - 3.0 * (x - target)
    return step
```

This makes the function self-contained, testable, and re-targetable. In the AtlasLearning playground, the scenario sliders are injected as module-level globals (`TARGET`, `DISTURBANCE`, etc.) before your script runs — that is convenient but less hygienic; convert to closures if you carry the controller into a real test harness.

## Fixed timestep vs. adaptive

For visualization and student work, fixed timestep is right: predictable framerate, simpler debugging, no surprise integration errors. The AtlasLearning simulator uses fixed `dt = 0.02 s` (50 Hz) with RK4 inside.

Adaptive methods (`scipy.integrate.solve_ivp`) are worth reaching for when the dynamics span very different time scales (stiff systems), or when you need a guaranteed error bound. They are *not* worth the complexity for first-pass control design.

## Returning the right thing from your step function

The simulator expects `step(state, t) -> float`. Common mistakes:

- Returning a NumPy `0-d` array (e.g., `np.array(5.0)`) — usually works but raises in some matplotlib contexts. Wrap in `float()`.
- Returning `None` from a code path you forgot to handle — produces a runtime error inside the simulator, not a visible "None returned" message.
- Returning a tuple — `(u_pole, u_cart)` instead of `u_pole + u_cart` is the most-common mistake when first decomposing a controller.

## Logging without slowing the loop

Don't `print()` inside a 50 Hz loop — the Pyodide stdout buffer fills up and the UI lags. Append to a list and inspect after:

```python
log = []
def step(state, t):
    u = ...
    log.append((t, state, u))
    return u
```

Then post-process `log` after the simulation returns.

## When you actually need speed

Vectorize across batches if you're rolling out many trajectories (parameter sweeps, Monte Carlo over initial conditions). NumPy's `vectorize` is convenience-only and slow; write your inner loop as a single matrix operation across the batch dimension and you'll get 10–100× speedups.
