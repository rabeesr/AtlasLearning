# NumPy broadcasting pitfalls

Most numerical bugs in robotics code are shape errors. Broadcasting makes most operations terse, but a few common patterns silently produce the *wrong* answer instead of an error.

## Row vs. column vector ambiguity

```python
v = np.array([1, 2, 3])         # shape (3,)
w = np.array([[1], [2], [3]])   # shape (3, 1)
```

`v` is **neither** a row nor a column vector — it is a rank-1 array. `v @ M` and `M @ v` both work because NumPy promotes it on the fly, but `v * w` produces a `(3, 3)` matrix via broadcasting, not an element-wise product. If you want strict column vectors, write `v.reshape(-1, 1)` and stay consistent.

## Outer product disguised as element-wise

```python
a = np.array([1, 2, 3])
b = np.array([[10], [20], [30]])
c = a * b   # shape (3, 3), not (3,)
```

This bites people computing residuals — they expect a vector and get a matrix. Symptom: a `lstsq` or norm call later fails with "Last 2 dimensions of the array must be square." Always print `.shape` when you're surprised.

## In-place modification of views

```python
A = np.zeros((3, 3))
row = A[0]
row[:] = [1, 2, 3]   # this DOES mutate A
row = row + 1        # this DOES NOT mutate A (creates a new array)
```

Slicing returns a view; arithmetic always creates a new array. If you wrote `A[0] = A[0] + 1`, that's an assignment back to the view's slot, which works. If you wrote `row = row + 1` after `row = A[0]`, `A` is unchanged.

## Integer division surprises

`np.array([3, 5, 7]) / 2` returns floats `[1.5, 2.5, 3.5]` (Python 3 semantics). But `np.array([3, 5, 7], dtype=np.int32) // 2` returns ints `[1, 2, 3]`. Mixing the two — e.g., dividing a time index by `dt` — can silently truncate. Cast to float early if you mean real arithmetic.

## Dtype propagation in matrix products

If `A` is `float32` and `b` is `float64`, `A @ b` returns `float64`. But if you then assign back into `A`, the values get truncated. Long-running simulations can lose precision this way without any warning. Standardize on `float64` everywhere unless you are explicitly optimizing memory.

## Debugging tips

- When a result looks wrong, print `.shape` and `.dtype` for every input before suspecting the math.
- `np.testing.assert_allclose(actual, expected, atol=1e-9)` is more informative than `assert (a == b).all()`.
- `np.set_printoptions(precision=4, suppress=True)` makes printed matrices readable.
