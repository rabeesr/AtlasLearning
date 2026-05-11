import math


def test_integrates_x_squared():
    est = integrate(lambda x: x * x, 0.0, 1.0, 10)
    assert abs(est - 1.0 / 3.0) < 1e-9, (
        f"∫_0^1 x^2 dx = 1/3, got {est}"
    )


def test_exact_on_cubic():
    # Simpson's rule is exact for polynomials up to degree 3.
    # ∫_0^2 (x^3 - 2x + 1) dx = [x^4/4 - x^2 + x]_0^2 = 4 - 4 + 2 = 2
    est = integrate(lambda x: x ** 3 - 2 * x + 1, 0.0, 2.0, 4)
    assert abs(est - 2.0) < 1e-10, (
        f"Simpson's rule should be exact on a cubic; got {est}"
    )


def test_integrates_sin_over_zero_pi():
    est = integrate(math.sin, 0.0, math.pi, 100)
    assert abs(est - 2.0) < 1e-6, (
        f"∫_0^π sin(x) dx = 2, got {est}"
    )


def test_integrates_exp():
    est = integrate(math.exp, 0.0, 1.0, 50)
    expected = math.e - 1.0
    assert abs(est - expected) < 1e-8, (
        f"∫_0^1 e^x dx = e - 1 ≈ {expected}, got {est}"
    )


def test_odd_n_raises_value_error():
    try:
        integrate(lambda x: x, 0.0, 1.0, 3)
    except ValueError:
        return
    raise AssertionError("integrate should reject odd n with ValueError")


def test_zero_n_raises_value_error():
    try:
        integrate(lambda x: x, 0.0, 1.0, 0)
    except ValueError:
        return
    raise AssertionError("integrate should reject n=0 with ValueError")
