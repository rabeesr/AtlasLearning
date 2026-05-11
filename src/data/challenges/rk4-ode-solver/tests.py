import numpy as np


def test_initial_value_preserved():
    # y0 must come through untouched — controllers depend on it.
    x = np.linspace(0.0, 1.0, 11)
    y = ode_rk4(lambda _x, y: y, 1.0, x)
    assert y.shape == x.shape, (
        f"output length {y.shape} must match grid length {x.shape}"
    )
    assert abs(y[0] - 1.0) < 1e-12, (
        f"y[0] must equal y0=1.0 exactly; got {y[0]}"
    )


def test_exponential_growth():
    # y' = y, y(0) = 1 -> y(x) = e^x.
    x = np.linspace(0.0, 2.0, 201)
    y = ode_rk4(lambda _x, y: y, 1.0, x)
    expected = np.exp(x)
    err = float(np.max(np.abs(y - expected)))
    assert err < 1e-6, (
        f"RK4 vs e^x: max error {err} exceeded 1e-6 — check the k1..k4 weights"
    )


def test_exponential_decay():
    # First-order motor coasting to rest: y' = -y, y(0) = 1 -> y(x) = e^{-x}.
    x = np.linspace(0.0, 5.0, 501)
    y = ode_rk4(lambda _x, y: -y, 1.0, x)
    expected = np.exp(-x)
    err = float(np.max(np.abs(y - expected)))
    assert err < 1e-6, (
        f"motor decay vs e^-x: max error {err} exceeded 1e-6"
    )


def test_linear_rhs_uses_x_argument():
    # y' = x, y(0) = 0 -> y(x) = x^2/2. This catches f-callers that ignore x.
    x = np.linspace(0.0, 3.0, 31)
    y = ode_rk4(lambda x, _y: x, 0.0, x)
    expected = 0.5 * x ** 2
    err = float(np.max(np.abs(y - expected)))
    assert err < 1e-10, (
        f"RK4 must pass both x and y to f; max error vs x^2/2 was {err}"
    )


def test_handles_nonuniform_grid():
    # Mixed step sizes — h must be computed per step, not once.
    x = np.array([0.0, 0.3, 0.5, 0.6, 0.65, 0.7, 0.75, 0.8, 0.9, 1.0])
    y = ode_rk4(lambda _x, y: y, 1.0, x)
    expected = np.exp(x)
    err = float(np.max(np.abs(y - expected)))
    assert err < 1e-3, (
        f"non-uniform grid: max error {err} too large; "
        "did you compute h inside the loop?"
    )
