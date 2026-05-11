def integrate(f, a, b, n):
    """Composite Simpson's rule on n equal subintervals.

    Scenario: computing distance travelled from a velocity profile v(t).
    """
    if not isinstance(n, int) or n <= 0 or n % 2 != 0:
        raise ValueError(f"n must be a positive even integer, got {n!r}")

    h = (b - a) / n
    # Teaching print: integration setup.
    print(f"integrate: bounds=[{a}, {b}], n={n}, h={h:.6g}")

    # Endpoints get weight 1.
    total = f(a) + f(b)

    # Interior nodes: odd index -> weight 4, even index -> weight 2.
    for i in range(1, n):
        weight = 4 if i % 2 == 1 else 2
        xi = a + i * h
        total += weight * f(xi)

    result = total * h / 3.0
    # Teaching print: final integral value.
    print(f"  weighted sum (before h/3) = {total:.10g}")
    print(f"  integral estimate = {result:.10g}")
    return result
