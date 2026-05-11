def integrate(f, a, b, n):
    if not isinstance(n, int) or n <= 0 or n % 2 != 0:
        raise ValueError(f"n must be a positive even integer, got {n!r}")
    h = (b - a) / n
    total = f(a) + f(b)
    for i in range(1, n):
        weight = 4 if i % 2 == 1 else 2
        total += weight * f(a + i * h)
    return total * h / 3.0
