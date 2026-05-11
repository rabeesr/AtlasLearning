import numpy as np


def power_iteration(A, num_iters=1000, tol=1e-10):
    """Return (eigenvalue, eigenvector) for the dominant eigenpair of A.

    Do not use numpy.linalg.eig / eigvals / svd.

    Parameters
    ----------
    A : np.ndarray, shape (n, n)
    num_iters : int, max iterations
    tol : float, convergence tolerance on the Rayleigh quotient

    Returns
    -------
    (float, np.ndarray)
        Dominant eigenvalue and its unit-norm eigenvector.
    """
    # TODO: implement
    raise NotImplementedError("power_iteration not implemented yet")
