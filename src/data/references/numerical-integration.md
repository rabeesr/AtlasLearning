# Numerical integration cheat sheet

For dynamical systems \(\dot x = f(t, x)\) you almost always integrate numerically. Pick the scheme based on accuracy needed, stiffness, and how cheap a function evaluation is.

## Forward Euler

\[
x_{k+1} = x_k + h\, f(t_k, x_k)
\]

- Order \(O(h)\). Easy to write, easy to step at fixed rate, terrible for stiff or oscillatory systems.
- Use only for sanity checks, real-time controllers with very small \(h\), or when the dynamics are heavily damped.
- Stability region for the linear test problem is tiny — a marginally stable system (e.g., a pendulum) will *gain energy* under forward Euler.

## RK4 (classical Runge–Kutta)

\[
\begin{aligned}
k_1 &= f(t, x), \\
k_2 &= f(t + h/2, x + h k_1/2), \\
k_3 &= f(t + h/2, x + h k_2/2), \\
k_4 &= f(t + h, x + h k_3), \\
x_{k+1} &= x_k + \tfrac{h}{6}(k_1 + 2 k_2 + 2 k_3 + k_4).
\end{aligned}
\]

- Order \(O(h^4)\). Four function evaluations per step.
- The default for offline robot simulation: cart-pole, pendulums, planar arms, simple flight dynamics. Use \(h \in [10^{-3}, 10^{-2}]\) s for typical mechanical systems.

## Simpson's rule (definite integrals)

For \(\int_a^b f(x)\,dx\) with even number of intervals \(n\) and step \(h = (b-a)/n\):

\[
\int_a^b f \approx \tfrac{h}{3} \left[ f_0 + 4(f_1 + f_3 + \cdots) + 2(f_2 + f_4 + \cdots) + f_n \right].
\]

- Order \(O(h^4)\) for smooth integrands. Composite Simpson's is the right choice for integrating measured signals (energy, work, kinetic energy along a trajectory).

## When to pick which

- **Real-time control loop** at 100–1000 Hz: forward Euler is usually fine if your dynamics are stable.
- **Off-line trajectory rollout** for visualization or planning: RK4.
- **Integrating a measured signal** (sensor data, log file): Simpson's rule for smooth signals, trapezoidal for noisier ones.
- **Stiff systems** (chemistry, very different time constants): you need implicit methods (backward Euler, BDF) — outside the scope of this cheat sheet.

## A common mistake

Implicit Euler is **not** the same as backward Euler with one Newton step — that combination is still effectively explicit and inherits forward-Euler stability problems. If a tutor or textbook calls it "semi-implicit," double-check what they mean.
