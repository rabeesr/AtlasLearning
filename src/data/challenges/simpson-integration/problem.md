# Simpson's Rule Integration

Compute work, energy, signal averages, and Bayes-filter marginals — all of them are integrals. Simpson's rule is the canonical fixed-grid quadrature: 4× more accurate than the trapezoidal rule for the same number of function evaluations.

## Task

Implement `integrate(f, a, b, n)` using **Simpson's rule** over `n` equal subintervals:

```
∫_a^b f(x) dx ≈ (h/3) [ f(x_0) + 4 Σ_odd f(x_i) + 2 Σ_even f(x_i) + f(x_n) ]
```

where `h = (b - a) / n` and `x_i = a + i h`.

You may not call `scipy.integrate.*`, `numpy.trapz`, or `numpy.trapezoid`.

## Inputs

- `f` — a callable `float -> float`
- `a`, `b` — `float` integration bounds
- `n` — number of subintervals, an **even** positive integer

## Output

- A `float` approximation of `∫_a^b f(x) dx`.

## Errors

- If `n` is not a positive even integer, raise `ValueError`.

## Example

```python
integrate(lambda x: x**2, 0.0, 1.0, 10)       # -> ~0.3333...
integrate(math.sin, 0.0, math.pi, 100)        # -> ~2.0
```

## Hints

- Index parity matters: the endpoints get weight `1`, odd-indexed interior points get weight `4`, even-indexed interior points get weight `2`.
- Simpson's rule is **exact** for cubic polynomials — your test on a cubic should hit machine precision.
