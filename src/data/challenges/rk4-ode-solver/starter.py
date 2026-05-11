import numpy as np


def ode_rk4(f, y0, x_grid):
    """Fourth-order Runge–Kutta integration of dy/dx = f(x, y) on x_grid.

    Do not use scipy.integrate.

    Parameters
    ----------
    f : Callable[[float, float], float]
    y0 : float
    x_grid : np.ndarray, shape (N,), monotonically increasing

    Returns
    -------
    np.ndarray, shape (N,)
        y_values, with y_values[0] == y0.
    """
    # TODO: implement
    raise NotImplementedError("ode_rk4 not implemented yet")
