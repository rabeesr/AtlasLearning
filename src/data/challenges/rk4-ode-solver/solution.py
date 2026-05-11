import numpy as np


def ode_rk4(f, y0, x_grid):
    """RK4 integration of dy/dx = f(x, y) on x_grid.

    Scenario: simulating a first-order motor model (or any damped first-order
    robot subsystem) under a fixed-step integrator.
    """
    x_grid = np.asarray(x_grid, dtype=float)
    n = x_grid.shape[0]
    y = np.zeros(n, dtype=float)
    y[0] = float(y0)

    # Teaching print: simulation setup.
    print(f"ode_rk4: n_steps={n - 1}, y0={y0}")
    print(f"  x range: [{x_grid[0]}, {x_grid[-1]}]")

    for i in range(n - 1):
        x_i = float(x_grid[i])
        y_i = float(y[i])
        h = float(x_grid[i + 1] - x_i)

        # Four RK4 slope estimates: anchor, two midpoints, endpoint.
        k1 = f(x_i,           y_i)
        k2 = f(x_i + 0.5 * h, y_i + 0.5 * h * k1)
        k3 = f(x_i + 0.5 * h, y_i + 0.5 * h * k2)
        k4 = f(x_i + h,       y_i + h * k3)

        y[i + 1] = y_i + (h / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)

        # Teaching print: log the first few steps so the recurrence is visible.
        if i < 3 or i == n - 2:
            print(
                f"  step {i:4d}: x={x_i:.4f} h={h:.4f} "
                f"k1={k1:.4f} k4={k4:.4f} y_next={y[i + 1]:.6f}"
            )

    print(f"ode_rk4: y[-1] = {y[-1]:.6g}")
    return y
