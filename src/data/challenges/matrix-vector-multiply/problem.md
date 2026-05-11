# Matrix–Vector Multiply From Scratch

Robotics math piles up: every transform, every Jacobian, every Kalman update is a matrix–vector product underneath. Before you trust `numpy.dot`, build the operation by hand.

## Task

Implement `matvec(A, x)` that returns the product `A @ x` **without** using `numpy.dot`, `numpy.matmul`, the `@` operator, or `np.einsum`. You may use NumPy for array creation, shape inspection, and elementwise arithmetic.

## Inputs

- `A` — a 2D `numpy.ndarray` of shape `(m, n)`
- `x` — a 1D `numpy.ndarray` of shape `(n,)`

## Output

- A 1D `numpy.ndarray` of shape `(m,)` whose `i`-th entry equals `sum_j A[i, j] * x[j]`.

## Errors

- If `A.shape[1] != x.shape[0]`, raise `ValueError` with a message containing the word `"shape"`.

## Example

```python
import numpy as np
A = np.array([[1.0, 2.0],
              [3.0, 4.0]])
x = np.array([1.0, 1.0])
matvec(A, x)   # -> array([3.0, 7.0])
```

## Hints

- Two nested loops are enough, but a single loop over rows using a vector dot via `np.sum(A[i] * x)` is cleaner.
- Validate shapes first — fail fast with a clear error.
