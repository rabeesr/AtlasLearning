import numpy as np


def test_solves_2x2_system():
    A = np.array([[2.0, 1.0], [5.0, 7.0]])
    b = np.array([11.0, 13.0])
    x = gauss_solve(A, b)
    assert np.allclose(A @ x, b, atol=1e-8), f"residual too large; A@x = {A @ x}"


def test_solves_3x3_system():
    A = np.array(
        [[3.0, 2.0, -4.0],
         [2.0, 3.0, 3.0],
         [5.0, -3.0, 1.0]]
    )
    b = np.array([3.0, 15.0, 14.0])
    x = gauss_solve(A, b)
    assert np.allclose(A @ x, b, atol=1e-8), f"A@x = {A @ x}, expected {b}"


def test_requires_pivoting():
    # Zero on the diagonal — without pivoting this would divide by zero.
    A = np.array(
        [[0.0, 2.0, 1.0],
         [1.0, -1.0, 3.0],
         [2.0, 1.0, -1.0]]
    )
    b = np.array([5.0, 4.0, 0.0])
    x = gauss_solve(A, b)
    assert np.allclose(A @ x, b, atol=1e-8), (
        f"partial pivoting required; A@x = {A @ x}"
    )


def test_identity_returns_b():
    I = np.eye(5)
    b = np.array([1.0, -2.0, 3.0, 4.5, -0.5])
    x = gauss_solve(I, b)
    assert np.allclose(x, b, atol=1e-12), f"I x = b should give x = b, got {x}"


def test_singular_matrix_raises():
    # Rank-deficient: row 2 == 2 * row 0.
    A = np.array(
        [[1.0, 2.0, 3.0],
         [4.0, 5.0, 6.0],
         [2.0, 4.0, 6.0]]
    )
    b = np.array([1.0, 2.0, 3.0])
    try:
        gauss_solve(A, b)
    except Exception as exc:
        name = type(exc).__name__
        assert "Singular" in name or "singular" in str(exc).lower(), (
            f"expected SingularMatrixError, got {name}: {exc}"
        )
        return
    raise AssertionError("gauss_solve should raise on a singular matrix")
