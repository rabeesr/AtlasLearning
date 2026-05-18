# Derivatives as rates of change (robotics flavor)

Calculus textbooks introduce derivatives as the slope of a tangent line. That's true, but in robotics the more useful framing is: a derivative tells you **how quickly something is changing right now**, and the integral tells you **how much has accumulated so far**.

## Position, velocity, acceleration

If \(x(t)\) is position, then \(\dot x = dx/dt\) is velocity and \(\ddot x = d^2 x / dt^2\) is acceleration. The dot notation is the physics convention; the prime notation \(x'\) is the calculus convention. Robotics papers use dots almost exclusively.

For a multi-DOF system you carry around a state vector \(q \in \mathbb{R}^n\) (joint angles), and \(\dot q\) and \(\ddot q\) are vectors of the same shape.

## Jacobian: rate of change of an output with respect to an input

For a forward-kinematics function \(p = f(q)\) mapping joint angles to end-effector position, the Jacobian is

\[
J(q) = \frac{\partial f}{\partial q} \in \mathbb{R}^{m \times n}.
\]

It tells you: if I move each joint by a small \(\delta q\), how does the end-effector position change? Specifically \(\delta p \approx J(q) \, \delta q\), or in continuous time \(\dot p = J(q) \dot q\). Robotics calls this the "manipulator Jacobian"; the same object in machine learning is called the Jacobian of a function.

## Numerical derivatives: forward, backward, central

Given a measured signal \(y_k\) sampled at intervals \(\Delta t\):

- Forward difference: \((y_{k+1} - y_k)/\Delta t\). \(O(\Delta t)\) error, needs a future sample.
- Backward difference: \((y_k - y_{k-1})/\Delta t\). \(O(\Delta t)\) error, real-time safe.
- Central difference: \((y_{k+1} - y_{k-1})/(2\Delta t)\). \(O(\Delta t^2)\) error, needs a future sample.

Real-time controllers use backward differences out of necessity; offline analysis uses central. Either way, finite-difference derivatives **amplify noise** — the noise floor of \(\dot y\) is roughly \(\sigma_y / \Delta t\). Filter before you differentiate.

## Integrals: accumulating something

The integral \(\int_0^t f(\tau)\,d\tau\) is the running total. In control:

- Integrating velocity gives position (dead reckoning).
- Integrating force gives momentum.
- Integrating error gives the integral term of a PID — eliminates steady-state offsets.
- Integrating angular velocity gives orientation, but only for small motions; for large motions you need quaternion or rotation-matrix kinematics.

Numerical integration accumulates error. After thousands of timesteps a forward-Euler integrator can drift visibly. Use RK4 for offline rollouts and check periodically against a known reference if you're integrating something critical.

## Why this matters for the topic markdown

When the calculus topic shows the chain rule, the Jacobian, or numerical differentiation, the *robotics framing* is what makes it stick. The math is the same; the questions you ask of it differ. If you're not sure what a derivative *is for* in a given context, ask the tutor what the corresponding rate-of-change is in a real robot system.
