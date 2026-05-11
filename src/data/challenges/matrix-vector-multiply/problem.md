# Rotate a Sensor Reading Into the Base Frame

A depth camera mounted on the robot's wrist returns a point measurement `p_cam` in the camera frame. To plan motion, you need that point in the **base frame** of the arm. The transformation is a single matrix-vector product `p_base = R @ p_cam`, where `R` is a 3x3 rotation matrix from the camera frame to the base frame.

Every Kalman update, every Jacobian application, and every coordinate change in robotics sits on top of this one operation. Before you trust `numpy.dot`, build it yourself so you know exactly what it costs and when it silently broadcasts the wrong shape.

## Task

Implement `matvec(A, x)` that returns the product `A @ x` **without** using `numpy.dot`, `numpy.matmul`, the `@` operator, or `np.einsum`. You may use NumPy for array creation, shape inspection, and elementwise arithmetic.

## Inputs

- `A` — a 2D `numpy.ndarray` of shape `(m, n)` (e.g. a rotation matrix; units: dimensionless)
- `x` — a 1D `numpy.ndarray` of shape `(n,)` (e.g. a point in metres)

## Output

- A 1D `numpy.ndarray` of shape `(m,)` whose `i`-th entry equals `sum_j A[i, j] * x[j]`. Units inherit from `x` (metres in, metres out).

## Errors

- If `A.shape[1] != x.shape[0]`, raise `ValueError` with a message containing the word `"shape"`. A wrist-frame point with a base-to-tool transform is a real bug — fail loudly.

## Worked example

A 90-degree rotation about z, applied to the unit-x vector:

```python
import numpy as np
R = np.array([[0.0, -1.0, 0.0],
              [1.0,  0.0, 0.0],
              [0.0,  0.0, 1.0]])
p_cam = np.array([1.0, 0.0, 0.0])   # metres, in the camera frame
matvec(R, p_cam)   # -> array([0.0, 1.0, 0.0])  # metres, in the base frame
```

## Tests you'll be graded against

- `test_identity_returns_input` — R = I must leave a point unchanged.
- `test_rotates_unit_x_into_y` — a 90-degree z-rotation maps e_x to e_y.
- `test_zero_vector_returns_zero` — a point at the camera origin maps to base origin.
- `test_nonsquare_matrix` — handles a tall/wide A (e.g. a projection matrix).
- `test_shape_mismatch_raises_value_error` — wrong frame dim raises ValueError mentioning "shape".

## What to watch out for

- **Shape silently wrong.** `np.array([1, 2, 3]).shape` is `(3,)`, not `(3, 1)`. Validate before computing.
- **Don't mutate `A` or `x`.** Allocate a fresh output array.
- **Loop direction.** Row `i` of the output is the dot of row `i` of `A` with `x`, not column `i`.
