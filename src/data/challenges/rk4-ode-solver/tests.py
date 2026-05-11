import numpy as np


def test_initial_value_preserved():
    x = np.linspace(0.0, 1.0, 11)
    y = ode_rk4(lambda _x, y: y, 1.0, x)
    assert y.shape == x.shape, f"output shape {y.shape} != grid shape {x.shape}"
    assert abs(y[0] - 1.0) < 1e-12, f"y[0] must equal y0=1.0, got {y[0]}"


def test_exponential_growth():
    # y' = y, y(0) = 1 -> y(x) = e^x
    x = np.linspace(0.0, 2.0, 201)
    y = ode_rk4(lambda _x, y: y, 1.0, x)
    expected = np.exp(x)
    err = float(np.max(np.abs(y - expected)))
    assert err < 1e-6, f"max error vs e^x was {err}"


def test_exponential_decay():
    # y' = -y, y(0) = 1 -> y(x) = e^{-x}
    x = np.linspace(0.0, 5.0, 501)
    y = ode_rk4(lambda _x, y: -y, 1.0, x)
    expected = np.exp(-x)
    err = float(np.max(np.abs(y - expected)))
    assert err < 1e-6, f"max error vs e^{{-x}} was {err}"


def test_linear_rhs_uses_x_argument():
    # y' = x, y(0) = 0 -> y(x) = x^2 / 2; this fails if `f` is called
    # with the wrong x argument.
    x = np.linspace(0.0, 3.0, 31)
    y = ode_rk4(lambda x, _y: x, 0.0, x)
    expected = 0.5 * x ** 2
    err = float(np.max(np.abs(y - expected)))
    assert err < 1e-10, f"max error vs x^2/2 was {err}"


def test_handles_nonuniform_grid():
    # Non-uniform grid: step size shrinks toward the end.
    x = np.array([0.0, 0.3, 0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 0.9, 1.0])
    y = ode_rk4(lambda _x, y: y, 1.0, x)
    expected = np.exp(x)
    err = float(np.max(np.abs(y - expected)))
    assert err < 1e-3, f"max error on non-uniform grid was {err}"
