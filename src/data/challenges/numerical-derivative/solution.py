def derivative(f, x, h=1e-5):
    """Central-difference estimate of f'(x).

    Scenario: estimating instantaneous angular velocity from a discrete
    encoder angle profile.
    """
    # Sample on either side of x. Both calls cost one function evaluation.
    f_plus = f(x + h)
    f_minus = f(x - h)
    est = (f_plus - f_minus) / (2.0 * h)

    # Teaching prints: surface the sample values and the step size.
    print(f"derivative: x={x}, h={h}")
    print(f"  f(x+h)={f_plus:.10g}, f(x-h)={f_minus:.10g}")
    print(f"  estimate f'(x) = {est:.10g}")
    return est
