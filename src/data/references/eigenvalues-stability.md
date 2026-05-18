# Eigenvalues & stability intuition

For a linear system \(\dot x = A x\), the long-term behavior is decided by the eigenvalues of \(A\) — not by the entries of \(A\) themselves. Tuning controllers is largely about pushing those eigenvalues around.

## The fundamental theorem you need

Decompose \(A = V \Lambda V^{-1}\) where \(\Lambda = \operatorname{diag}(\lambda_1, \ldots, \lambda_n)\). Then \(x(t) = V e^{\Lambda t} V^{-1} x(0)\). Each mode evolves as \(e^{\lambda_i t}\).

- \(\operatorname{Re}(\lambda_i) < 0\) for all \(i\): the system decays to zero. Stable.
- Any \(\operatorname{Re}(\lambda_i) > 0\): the system blows up exponentially. Unstable.
- \(\operatorname{Re}(\lambda_i) = 0\): marginal — small disturbances can push you either way.
- \(\operatorname{Im}(\lambda_i) \neq 0\): the mode oscillates at frequency \(|\operatorname{Im}(\lambda_i)| / 2\pi\) Hz.

## Discrete-time analog

For \(x_{k+1} = A x_k\), stability requires \(|\lambda_i| < 1\) for all \(i\). The unit circle replaces the imaginary axis.

This matters when you discretize a continuous controller: a marginally stable continuous design \((\operatorname{Re}(\lambda) = 0)\) becomes mildly unstable in discrete time \((|\lambda| = 1 + \epsilon)\) due to numerical error. Always check the discrete-time eigenvalues after discretization.

## Spectral radius and convergence

The spectral radius \(\rho(A) = \max_i |\lambda_i|\) is the asymptotic per-step growth (or decay) rate of \(\|x_k\|\). Iterative methods (Jacobi, Gauss–Seidel, power iteration) converge if and only if the relevant matrix has spectral radius less than one. Convergence speed is roughly \(\rho^k\); halving the error takes \(\log(2) / \log(1/\rho)\) iterations.

## When eigenvalues lie

Three traps:

1. **Non-normal matrices** (\(A A^\top \neq A^\top A\)) can have all-negative eigenvalues and still cause huge transient growth before they decay. Eigenvalues describe long-term behavior, not the first ten seconds. For transient analysis, look at the singular values of \(e^{At}\) for small \(t\), or the pseudospectrum.

2. **Repeated eigenvalues with defective Jordan structure**: \(A\) is not diagonalizable, so the time response includes polynomial-times-exponential terms like \(t e^{\lambda t}\). A repeated zero eigenvalue with a Jordan block gives you a *ramp* response, not a constant.

3. **Numerical conditioning**: if \(V\) is nearly singular, the eigendecomposition is unstable. Schur decomposition is safer for analysis; for control design, prefer matrix forms that don't require diagonalization.

## How this shows up in cart-pole / pendulums

The cart-pole linearized around the upright equilibrium has eigenvalues at \(\pm\sqrt{g/l}\) (roughly) — one in the right half plane. The job of a stabilizing controller is to use feedback to move both poles to the left half plane. That's the entire principle of pole placement.

When you design a controller and it "feels jittery," check the closed-loop eigenvalues. If two of them are complex conjugates near the imaginary axis, you have a lightly-damped mode you can damp by adding more derivative feedback or shifting those poles further left.
