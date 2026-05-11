import numpy as np


def ode_rk4(f, y0, x_grid):
    x_grid = np.asarray(x_grid, dtype=float)
    n = x_grid.shape[0]
    y = np.zeros(n, dtype=float)
    y[0] = float(y0)
    for i in range(n - 1):
        x_i = float(x_grid[i])
        y_i = float(y[i])
        h = float(x_grid[i + 1] - x_i)
        k1 = f(x_i, y_i)
        k2 = f(x_i + 0.5 * h, y_i + 0.5 * h * k1)
        k3 = f(x_i + 0.5 * h, y_i + 0.5 * h * k2)
        k4 = f(x_i + h, y_i + h * k3)
        y[i + 1] = y_i + (h / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)
    return y
