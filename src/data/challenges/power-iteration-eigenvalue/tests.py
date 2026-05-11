import numpy as np


def test_diagonal_matrix_dominant_eigenvalue():
    A = np.diag([5.0, 2.0, 1.0])
    lam, v = power_iteration(A)
    assert abs(lam - 5.0) < 1e-6, f"expected eigenvalue 5.0, got {lam}"
    assert abs(np.linalg.norm(v) - 1.0) < 1e-8, (
        f"eigenvector must be unit-norm, got norm {np.linalg.norm(v)}"
    )


def test_eigenvector_satisfies_relation():
    A = np.array([[4.0, 1.0], [1.0, 3.0]])
    lam, v = power_iteration(A)
    residual = np.linalg.norm(A @ v - lam * v)
    assert residual < 1e-5, (
        f"A v should equal lam v; residual was {residual} (lam={lam}, v={v})"
    )


def test_symmetric_3x3_known_spectrum():
    # Eigenvalues of this matrix are 6, 3, 1.
    A = np.array(
        [[4.0, 1.0, 1.0],
         [1.0, 3.0, 0.0],
         [1.0, 0.0, 3.0]]
    )
    lam, _ = power_iteration(A)
    # Dominant eigenvalue is approx 4.7320508 (the largest root of the
    # characteristic polynomial); compare to numpy's reference.
    ref = float(np.max(np.linalg.eigvalsh(A)))
    assert abs(lam - ref) < 1e-5, f"expected {ref}, got {lam}"


def test_returns_unit_eigenvector():
    A = np.array([[2.0, 0.0, 0.0], [0.0, -1.0, 0.0], [0.0, 0.0, 0.5]])
    lam, v = power_iteration(A)
    assert abs(lam - 2.0) < 1e-6, f"expected 2.0, got {lam}"
    assert abs(np.linalg.norm(v) - 1.0) < 1e-8, (
        f"eigenvector norm should be 1, got {np.linalg.norm(v)}"
    )
    # Eigenvector should be aligned with e0.
    assert abs(abs(v[0]) - 1.0) < 1e-5, f"expected v ~ ±e0, got {v}"
