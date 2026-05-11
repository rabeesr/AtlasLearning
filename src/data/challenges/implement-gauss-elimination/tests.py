import numpy as np


def test_solves_2x2_system():
    # Reduced 2-DOF equilibrium toy.
    A = np.array([[2.0, 1.0], [5.0, 7.0]])
    b = np.array([11.0, 13.0])
    x = gauss_solve(A, b)
    residual = float(np.max(np.abs(A @ x - b)))
    assert residual < 1e-8, (
        f"reaction forces should reproduce loads; residual was {residual} (x={x})"
    )


def test_solves_3x3_system():
    # Well-conditioned 3-link pose.
    A = np.array(
        [[3.0, 2.0, -4.0],
         [2.0, 3.0,  3.0],
         [5.0, -3.0, 1.0]]
    )
    b = np.array([3.0, 15.0, 14.0])
    x = gauss_solve(A, b)
    assert np.allclose(A @ x, b, atol=1e-8), (
        f"A @ x should equal the load vector; got {A @ x}, expected {b}"
    )


def test_requires_pivoting():
    # Zero on the diagonal — without partial pivoting this divides by zero.
    A = np.array(
        [[0.0,  2.0,  1.0],
         [1.0, -1.0,  3.0],
         [2.0,  1.0, -1.0]]
    )
    b = np.array([5.0, 4.0, 0.0])
    x = gauss_solve(A, b)
    assert np.allclose(A @ x, b, atol=1e-8), (
        f"partial pivoting must handle zero-diagonal poses; A@x={A @ x}, expected {b}"
    )


def test_identity_returns_b():
    # A pose whose equilibrium equations are already decoupled.
    I = np.eye(5)
    b = np.array([1.0, -2.0, 3.0, 4.5, -0.5])
    x = gauss_solve(I, b)
    assert np.allclose(x, b, atol=1e-12), (
        f"I x = b means x = b; got {x}, expected {b}"
    )


def test_singular_pose_raises():
    # Rank-deficient A: row 2 = 2 * row 0. Corresponds to two collinear links.
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
            f"a degenerate pose must surface as SingularMatrixError; "
            f"got {name}: {exc}"
        )
        return
    raise AssertionError(
        "gauss_solve must raise SingularMatrixError on a degenerate pose, "
        "not return a silent wrong answer"
    )
