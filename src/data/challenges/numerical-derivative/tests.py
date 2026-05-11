import math


def test_constant_angular_velocity():
    # theta(t) = sin(t); at t=0, omega = cos(0) = 1 rad/s.
    est = derivative(math.sin, 0.0)
    assert abs(est - 1.0) < 1e-6, (
        f"omega at t=0 for sin(t) should be 1 rad/s; got {est}"
    )


def test_decelerating_joint():
    # theta(t) = cos(t); at t=pi/2, omega = -sin(pi/2) = -1 rad/s.
    est = derivative(math.cos, math.pi / 2)
    assert abs(est - (-1.0)) < 1e-6, (
        f"omega at t=pi/2 for cos(t) should be -1 rad/s; got {est}"
    )


def test_exponential_motion_profile():
    # theta(t) = e^t -> theta'(t) = e^t.
    x = 1.5
    est = derivative(math.exp, x)
    assert abs(est - math.exp(x)) < 1e-4, (
        f"d/dx e^x at {x} should be {math.exp(x)}; got {est}"
    )


def test_cubic_position_profile():
    # theta(t) = t^3 -> theta'(t) = 3 t^2; at t=2 that's 12.
    est = derivative(lambda t: t ** 3, 2.0)
    assert abs(est - 12.0) < 1e-6, (
        f"d/dx t^3 at 2 should be 12; got {est}"
    )


def test_step_size_argument_is_used():
    # Central differences are exact on quadratics, so even h=1e-2 must be tight.
    est = derivative(lambda t: 2 * t ** 2 + t, 3.0, h=1e-2)
    assert abs(est - 13.0) < 1e-6, (
        f"central diff is exact on a quadratic; 2t^2+t at t=3 -> 13; got {est}"
    )
