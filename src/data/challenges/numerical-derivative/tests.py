import math


def test_derivative_of_sin_at_zero():
    est = derivative(math.sin, 0.0)
    assert abs(est - 1.0) < 1e-6, f"d/dx sin(x) at 0 is 1, got {est}"


def test_derivative_of_cos_at_pi_over_two():
    est = derivative(math.cos, math.pi / 2)
    assert abs(est - (-1.0)) < 1e-6, (
        f"d/dx cos(x) at π/2 is -1, got {est}"
    )


def test_derivative_of_exp():
    x = 1.5
    est = derivative(math.exp, x)
    assert abs(est - math.exp(x)) < 1e-4, (
        f"d/dx e^x at {x} is {math.exp(x)}, got {est}"
    )


def test_derivative_of_polynomial():
    # d/dx (x^3) = 3 x^2; at x=2 that's 12.
    est = derivative(lambda x: x ** 3, 2.0)
    assert abs(est - 12.0) < 1e-6, f"d/dx x^3 at 2 is 12, got {est}"


def test_step_size_argument_is_used():
    # If h is plumbed correctly, a much larger h on a polynomial gives a
    # still-tight answer because central differences are exact on quadratics.
    est = derivative(lambda x: 2 * x ** 2 + x, 3.0, h=1e-2)
    assert abs(est - 13.0) < 1e-6, (
        f"d/dx (2x^2+x) at 3 is 13 (exact for central diff on a quadratic), got {est}"
    )
