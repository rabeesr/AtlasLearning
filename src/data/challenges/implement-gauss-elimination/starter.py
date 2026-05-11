import numpy as np


class SingularMatrixError(ValueError):
    """Raised when Gaussian elimination encounters a zero pivot column."""


def gauss_solve(A, b):
    """Solve A x = b via Gaussian elimination with partial pivoting.

    Do NOT use np.linalg.solve / np.linalg.inv / np.linalg.lstsq.

    Parameters
    ----------
    A : np.ndarray, shape (n, n)
    b : np.ndarray, shape (n,)

    Returns
    -------
    x : np.ndarray, shape (n,)

    Raises
    ------
    SingularMatrixError
        If A is (numerically) singular.
    """
    # TODO: implement
    raise NotImplementedError("gauss_solve not implemented yet")
