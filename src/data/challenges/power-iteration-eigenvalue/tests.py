import numpy as np


def test_diagonal_inertia_dominant_mode():
    # Diagonal inertia tensor — dominant eigenvalue is the largest diagonal.
    M = np.diag([5.0, 2.0, 1.0])
    lam, v = power_iteration(M)
    assert abs(lam - 5.0) < 1e-6, (
        f"dominant moment of inertia is 5.0; power iteration returned {lam}"
    )
    assert abs(np.linalg.norm(v) - 1.0) < 1e-8, (
        f"eigenvector must be unit-norm; got ||v||={np.linalg.norm(v)}"
    )


def test_eigenvector_satisfies_relation():
    # SPD 2x2 — output must satisfy A v ~ lam v.
    A = np.array([[4.0, 1.0], [1.0, 3.0]])
    lam, v = power_iteration(A)
    residual = float(np.linalg.norm(A @ v - lam * v))
    assert residual < 1e-5, (
        f"A v should equal lam v; residual was {residual} (lam={lam}, v={v})"
    )


def test_symmetric_3x3_known_spectrum():
    # SPD 3x3 inertia-like matrix.
    A = np.array(
        [[4.0, 1.0, 1.0],
         [1.0, 3.0, 0.0],
         [1.0, 0.0, 3.0]]
    )
    lam, _ = power_iteration(A)
    # Ground truth from numpy (used only by the test, not by the solution).
    ref = float(np.max(np.linalg.eigvalsh(A)))
    assert abs(lam - ref) < 1e-5, (
        f"dominant eigenvalue should be ~{ref}; power iteration gave {lam}"
    )


def test_returns_unit_eigenvector():
    # Eigenvalues 2, -1, 0.5 -> dominant magnitude is 2 along e_0.
    A = np.diag([2.0, -1.0, 0.5])
    lam, v = power_iteration(A)
    assert abs(lam - 2.0) < 1e-6, (
        f"largest-magnitude eigenvalue is 2.0; got {lam}"
    )
    assert abs(np.linalg.norm(v) - 1.0) < 1e-8, (
        f"eigenvector norm should be 1; got {np.linalg.norm(v)}"
    )
    # Sign of the eigenvector is arbitrary — compare absolute value.
    assert abs(abs(v[0]) - 1.0) < 1e-5, (
        f"dominant axis should be +/- e_0; got v={v}"
    )
