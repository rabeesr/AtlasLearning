# Solve an ODE with RK4

Every continuous-time controller, every physics simulator, every dynamic model in robotics ends up integrating an ODE. The fourth-order Runge–Kutta method is the standard fixed-step workhorse: stable, accurate, and exactly what `scipy.integrate.solve_ivp` falls back on when you ask for `RK45`.

## Task

Implement `ode_rk4(f, y0, x_grid)` that returns the values of `y(x)` on the provided grid, where `y` satisfies the IVP

```
dy/dx = f(x, y),   y(x_grid[0]) = y0
```

You may **not** use `scipy.integrate.*`.

## Inputs

- `f` — a callable `(x: float, y: float) -> float`
- `y0` — `float`, initial value of `y` at `x_grid[0]`
- `x_grid` — 1D `numpy.ndarray` of monotonically increasing `x` values

## Output

- `y` — 1D `numpy.ndarray` of the same length as `x_grid`, with `y[0] == y0`.

## RK4 step

Given `(x_i, y_i)` and step size `h = x_{i+1} - x_i`:

```
k1 = f(x_i,         y_i)
k2 = f(x_i + h/2,   y_i + h k1 / 2)
k3 = f(x_i + h/2,   y_i + h k2 / 2)
k4 = f(x_i + h,     y_i + h k3)
y_{i+1} = y_i + h (k1 + 2 k2 + 2 k3 + k4) / 6
```

## Examples

- `y' = y`, `y(0) = 1` ⇒ `y(x) = e^x`
- `y' = -y`, `y(0) = 1` ⇒ `y(x) = e^{-x}`

## Hints

- The grid may be non-uniform — compute `h` at each step from `x_grid[i+1] - x_grid[i]`.
- Tests allow up to `1e-6` absolute error against the analytic solution on smooth problems.
