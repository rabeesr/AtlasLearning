import numpy as np


def matvec(A, x):
    """Return A @ x without using numpy.dot, numpy.matmul, or the @ operator.

    Parameters
    ----------
    A : np.ndarray, shape (m, n)
    x : np.ndarray, shape (n,)

    Returns
    -------
    np.ndarray, shape (m,)

    Raises
    ------
    ValueError
        If A.shape[1] != x.shape[0]. The message must include the word "shape".
    """
    # TODO: implement
    raise NotImplementedError("matvec not implemented yet")
