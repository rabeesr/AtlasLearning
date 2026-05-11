# Distance Travelled From a Velocity Profile

A wheeled robot executes a planned **velocity profile** `v(t)` between two waypoints. The distance covered between time `a` and time `b` is the integral

```
s = integral_a^b v(t) dt
```

There is no closed-form formula for an arbitrary profile — you compute it numerically. **Simpson's rule** is the canonical fixed-grid quadrature: 4x more accurate than the trapezoidal rule for the same number of velocity samples, and exact on cubic polynomials (which means it is exact for a cubic spline trajectory between two via-points). The same recipe gives you work done over a torque profile, energy from a power curve, and Bayes-filter marginals.

## Task

Implement `integrate(f, a, b, n)` using **composite Simpson's rule** over `n` equal subintervals:

```
integral_a^b f(x) dx ~ (h/3) [ f(x_0) + 4 sum_{i odd} f(x_i) + 2 sum_{i even} f(x_i) + f(x_n) ]
```

where `h = (b - a) / n` and `x_i = a + i * h`.

You may not call `scipy.integrate.*`, `numpy.trapz`, or `numpy.trapezoid`.

## Inputs

- `f` — a callable `float -> float`. The velocity profile `v(t)` (m/s).
- `a`, `b` — `float` integration bounds (s).
- `n` — number of subintervals, a **positive even integer**.

## Output

- A `float` approximation of the integral. Units: m if `f` is m/s and bounds are s.

## Errors

- If `n` is not a positive even integer, raise `ValueError`. Simpson's rule fundamentally needs paired intervals.

## Worked example

```python
import math
# Constant 1 m/s for 1 second -> exactly 1 m.
integrate(lambda t: 1.0, 0.0, 1.0, 10)         # -> 1.0
# v(t) = sin(t) over [0, pi] -> 2 m (analytic).
integrate(math.sin, 0.0, math.pi, 100)         # -> ~2.0
# v(t) = t^2 over [0, 1] -> 1/3 m.
integrate(lambda t: t**2, 0.0, 1.0, 10)        # -> ~0.3333...
```

## Tests you'll be graded against

- `test_integrates_quadratic_velocity` — t^2 over [0, 1] gives 1/3 to 1e-9.
- `test_exact_on_cubic_trajectory` — Simpson is exact on cubics; must hit 1e-10.
- `test_integrates_sin_velocity` — sin(t) over [0, pi] gives 2 to 1e-6.
- `test_integrates_exponential_profile` — e^t over [0, 1] gives e - 1.
- `test_odd_n_raises_value_error` — n=3 is rejected.
- `test_zero_n_raises_value_error` — n=0 is rejected.

## What to watch out for

- **Weight parity.** Endpoints get weight 1, odd-indexed interior points get 4, even-indexed interior points get 2. Off-by-one here is the most common bug.
- **`n` must be even.** Validate first, before computing `h`.
- **Exactness on cubics.** Your test on a cubic should hit machine precision. If it doesn't, your weights are wrong.
- **Don't preallocate a huge array.** Stream the sum — Simpson is one pass.
