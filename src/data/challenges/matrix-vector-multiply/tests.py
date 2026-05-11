import numpy as np


def test_identity_returns_input():
    I = np.eye(4)
    x = np.array([1.0, -2.0, 3.5, 0.25])
    y = matvec(I, x)
    assert y.shape == (4,), f"expected shape (4,) but got {y.shape}"
    assert np.allclose(y, x), (
        f"I @ x should leave the point unchanged; expected {x}, got {y}"
    )


def test_rotates_unit_x_into_y():
    # 90 deg rotation about z: e_x in camera frame should land on e_y in base frame.
    R = np.array([[0.0, -1.0, 0.0],
                  [1.0,  0.0, 0.0],
                  [0.0,  0.0, 1.0]])
    p_cam = np.array([1.0, 0.0, 0.0])
    p_base = matvec(R, p_cam)
    expected = np.array([0.0, 1.0, 0.0])
    assert np.allclose(p_base, expected), (
        f"90deg z-rotation should send e_x to e_y; expected {expected}, got {p_base}"
    )


def test_zero_vector_returns_zero():
    A = np.array([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])
    x = np.zeros(3)
    y = matvec(A, x)
    assert np.allclose(y, np.zeros(2)), (
        f"a point at the camera origin must map to base origin; got {y}"
    )


def test_nonsquare_matrix():
    # Projection-style 2x3 matrix.
    A = np.array([[1.0, 0.0, -1.0], [2.0, 1.0, 0.0]])
    x = np.array([1.0, 2.0, 3.0])
    y = matvec(A, x)
    expected = np.array([-2.0, 4.0])
    assert np.allclose(y, expected), (
        f"nonsquare matvec failed; expected {expected}, got {y}"
    )


def test_shape_mismatch_raises_value_error():
    A = np.zeros((3, 4))   # expects 4-d input
    x = np.zeros(5)        # but we hand it a 5-d point
    try:
        matvec(A, x)
    except ValueError as exc:
        assert "shape" in str(exc).lower(), (
            f"error message must mention 'shape' so the bug is obvious; got: {exc}"
        )
        return
    raise AssertionError(
        "matvec should raise ValueError on shape mismatch, not silently broadcast"
    )
