# Simulate a First-Order Motor Model With RK4

A DC motor under a constant input voltage obeys a first-order linear ODE:

```
tau * d omega / dt = -omega + K * V
```

where `omega(t)` is angular velocity, `tau` is the electrical/mechanical time constant, `K` is the motor gain, and `V` is the input voltage. To validate a controller in software before flashing firmware, you need to **simulate** this ODE numerically. The same simulator handles the damped pendulum, mass-spring-damper, and any other lumped-parameter robot subsystem.

The **fourth-order Runge-Kutta** method (RK4) is the fixed-step workhorse: stable, fourth-order accurate, and exactly what `scipy.integrate.solve_ivp` falls back to when you ask for `RK45`.

## Task

Implement `ode_rk4(f, y0, x_grid)` returning the values of `y(x)` on the provided grid, where `y` satisfies the IVP

```
dy/dx = f(x, y),    y(x_grid[0]) = y0
```

You may **not** use `scipy.integrate.*`.

## Inputs

- `f` — a callable `(x: float, y: float) -> float`. The right-hand side of the ODE (in our motor scenario, `(-y + K*V)/tau`).
- `y0` — `float`, initial value of `y` at `x_grid[0]` (e.g. initial angular velocity, rad/s).
- `x_grid` — 1D `numpy.ndarray` of monotonically increasing values (time samples, s).

## Output

- `y` — 1D `numpy.ndarray` of the same length as `x_grid`, with `y[0] == y0`. Units inherit from `y0`.

## RK4 step

Given `(x_i, y_i)` and step size `h = x_{i+1} - x_i`:

```
k1 = f(x_i,         y_i)
k2 = f(x_i + h/2,   y_i + h k1 / 2)
k3 = f(x_i + h/2,   y_i + h k2 / 2)
k4 = f(x_i + h,     y_i + h k3)
y_{i+1} = y_i + h (k1 + 2 k2 + 2 k3 + k4) / 6
```

## Worked example

The simplest possible motor model: `y' = y`, `y(0) = 1` has the analytic solution `y(x) = e^x`. RK4 with 200 steps over `[0, 2]` matches to better than 1e-6.

## Tests you'll be graded against

- `test_initial_value_preserved` — y[0] must equal y0 exactly.
- `test_exponential_growth` — y' = y matches e^x to 1e-6.
- `test_exponential_decay` — y' = -y matches e^{-x}; a first-order motor under zero input.
- `test_linear_rhs_uses_x_argument` — y' = x must give x^2 / 2; catches the bug where you ignore the x argument inside f.
- `test_handles_nonuniform_grid` — variable step sizes; RK4 must compute h per step.

## What to watch out for

- **Per-step `h`.** The grid may be non-uniform — compute `h = x_grid[i+1] - x_grid[i]` inside the loop, not once at the top.
- **Order of `k`s.** k2 and k3 use `h/2` for both the time and the y offset. k4 uses the full `h`.
- **Passing both arguments to `f`.** `f(x, y)`, not `f(y)`. Tests catch this.
- **Don't accumulate `y` in a Python list and convert at the end** — preallocate `np.zeros(n)` for clarity and speed.
