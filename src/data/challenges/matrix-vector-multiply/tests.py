import numpy as np


def test_identity_returns_input():
    I = np.eye(4)
    x = np.array([1.0, -2.0, 3.5, 0.25])
    y = matvec(I, x)
    assert y.shape == (4,), f"expected shape (4,), got {y.shape}"
    assert np.allclose(y, x), f"I @ x should equal x, got {y}"


def test_zero_vector_returns_zero():
    A = np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
    x = np.zeros(3)
    y = matvec(A, x)
    assert np.allclose(y, np.zeros(2)), f"A @ 0 should be 0, got {y}"


def test_known_small_case():
    A = np.array([[1.0, 2.0], [3.0, 4.0]])
    x = np.array([1.0, 1.0])
    y = matvec(A, x)
    assert np.allclose(y, [3.0, 7.0]), f"expected [3, 7], got {y}"


def test_nonsquare_matrix():
    A = np.array([[1.0, 0.0, -1.0], [2.0, 1.0, 0.0]])
    x = np.array([1.0, 2.0, 3.0])
    y = matvec(A, x)
    assert np.allclose(y, [-2.0, 4.0]), f"expected [-2, 4], got {y}"


def test_shape_mismatch_raises_value_error():
    A = np.zeros((3, 4))
    x = np.zeros(5)
    try:
        matvec(A, x)
    except ValueError as exc:
        assert "shape" in str(exc).lower(), (
            f"error message must mention 'shape', got: {exc}"
        )
        return
    raise AssertionError("matvec should have raised ValueError on shape mismatch")
