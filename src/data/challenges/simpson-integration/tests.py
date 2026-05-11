import math


def test_integrates_quadratic_velocity():
    # v(t) = t^2; distance over [0, 1] is 1/3 m.
    est = integrate(lambda t: t * t, 0.0, 1.0, 10)
    assert abs(est - 1.0 / 3.0) < 1e-9, (
        f"distance from v(t)=t^2 over [0,1] should be 1/3; got {est}"
    )


def test_exact_on_cubic_trajectory():
    # Simpson is exact on polynomials up to degree 3 (cubic splines welcome).
    # integral_0^2 (t^3 - 2 t + 1) dt = [t^4/4 - t^2 + t]_0^2 = 4 - 4 + 2 = 2.
    est = integrate(lambda t: t ** 3 - 2 * t + 1, 0.0, 2.0, 4)
    assert abs(est - 2.0) < 1e-10, (
        f"Simpson must be exact on a cubic; expected 2, got {est}"
    )


def test_integrates_sin_velocity():
    # v(t) = sin(t); integral over [0, pi] is 2.
    est = integrate(math.sin, 0.0, math.pi, 100)
    assert abs(est - 2.0) < 1e-6, (
        f"integral of sin over [0,pi] should be 2; got {est}"
    )


def test_integrates_exponential_profile():
    # v(t) = e^t; integral over [0, 1] is e - 1.
    est = integrate(math.exp, 0.0, 1.0, 50)
    expected = math.e - 1.0
    assert abs(est - expected) < 1e-8, (
        f"integral of e^t over [0,1] should be e-1 ~ {expected}; got {est}"
    )


def test_odd_n_raises_value_error():
    try:
        integrate(lambda t: t, 0.0, 1.0, 3)
    except ValueError:
        return
    raise AssertionError("Simpson's rule requires even n; integrate must reject n=3")


def test_zero_n_raises_value_error():
    try:
        integrate(lambda t: t, 0.0, 1.0, 0)
    except ValueError:
        return
    raise AssertionError("n=0 has no intervals to integrate over; must raise ValueError")
