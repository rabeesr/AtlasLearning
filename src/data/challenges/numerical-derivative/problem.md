# Numerical Derivatives via Central Differences

Symbolic differentiation is a luxury you rarely get on a real robot. Sensor models, learned policies, and arbitrary objective functions all force you to estimate derivatives numerically. The central difference is the cheapest second-order accurate option.

## Task

Implement `derivative(f, x, h=1e-5)` that returns an estimate of `f'(x)` using the **central difference**:

```
f'(x) ≈ (f(x + h) - f(x - h)) / (2 h)
```

## Inputs

- `f` — a callable `float -> float`
- `x` — a `float`
- `h` — step size (default `1e-5`)

## Output

- A `float` estimate of `f'(x)`.

## Example

```python
import math
derivative(math.sin, 0.0)        # -> ~1.0
derivative(lambda x: x**3, 2.0)  # -> ~12.0
```

## Hints

- Don't use SymPy or autograd. One line of arithmetic is enough.
- Central differences have error `O(h^2)` — picking `h` much smaller than `1e-8` makes it *worse* because of floating-point cancellation. The default `1e-5` is a good balance.
