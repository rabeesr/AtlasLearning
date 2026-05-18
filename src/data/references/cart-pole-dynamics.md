# Cart-pole dynamics primer

A cart-pole is the simplest non-trivial robotics control problem: a cart slides along a frictionless rail, with a pole hinged on top that can rotate freely. You apply a horizontal force to the cart and try to keep the pole upright.

## State and control

State \(s = (x, \dot x, \theta, \dot\theta)\) where \(x\) is the cart position along the rail and \(\theta\) is the pole's angle from upright (0 = balanced, positive = leaning to the right with standard right-handed conventions).

Control \(u\) is the horizontal force applied to the cart (in Newtons). The applied force is bounded; the AtlasLearning simulator clips it at ±20 N.

## Equations of motion

With cart mass \(M\), pole mass \(m\), pole half-length \(\ell\), and gravity \(g\):

\[
\ddot\theta = \frac{g \sin\theta - \cos\theta \cdot \frac{u + m \ell \dot\theta^2 \sin\theta}{M + m}}{\ell\left(\tfrac{4}{3} - \frac{m \cos^2\theta}{M+m}\right)}
\]

\[
\ddot x = \frac{u + m \ell (\dot\theta^2 \sin\theta - \ddot\theta \cos\theta)}{M + m}
\]

These are the standard formulas from Florian (2007) and used in nearly every cart-pole reference, including AtlasLearning's `robotics_sim.simulate_cart_pole`.

## Why the upright equilibrium is unstable

Linearizing about \(\theta = 0\) gives \(\ddot\theta \approx (3g / (\ell(4/3 - m/(M+m)))) \cdot \theta\). The pole's angular acceleration is *proportional to and the same sign as* the angle, which means small angles grow exponentially. This is the hallmark of an unstable equilibrium.

The eigenvalues of the linearized system have one strictly positive real part, so any open-loop strategy fails. Feedback control is the entire game.

## Strategy for a stabilizing controller

1. **First pass**: PD on the pole angle alone. \(u = -k_p \theta - k_d \dot\theta\). Picks like \(k_p \approx 60\), \(k_d \approx 8\) work with the default physics. The pole stays up but the cart drifts away.

2. **Add cart-position feedback**: \(u = -k_p \theta - k_d \dot\theta - k_x (x - x_{\text{target}}) - k_v \dot x\). Now the cart tracks the target. Tune \(k_x\) small (e.g., 3) so it doesn't fight the angle stabilization.

3. **Handle disturbances**: integral action helps for slow drifts, but on an unstable plant it must be gated — pause integration when the angle exceeds a threshold so it doesn't wind up.

4. **For a real challenge**: write the system as \(\dot s = A s + B u\) (the linearized matrices) and design an LQR. The optimal feedback gain falls out of solving the Riccati equation.

## What to expect in the simulator

- With no disturbance and no noise, the PD-on-angle baseline keeps the pole up indefinitely.
- Raise disturbance above ~2 N and the cart starts drifting noticeably; you'll see why position feedback matters.
- Raise sensor noise above ~0.05 rad and a high-gain PD starts chattering; that's the moment to add filtering or reduce \(k_d\).

The simulator initial condition is a small angular perturbation \(\theta_0 = 0.05\) rad. If your controller can't recover from that, it can't recover from anything.
