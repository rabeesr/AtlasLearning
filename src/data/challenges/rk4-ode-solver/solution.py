import numpy as np


def ode_rk4(f, y0, x_grid):
    """RK4 integration of dy/dx = f(x, y) on x_grid.

    Scenario: simulating a first-order motor model (or any damped first-order
    robot subsystem) under a fixed-step integrator.
    """
    x_grid = np.asarray(x_grid, dtype=float)
    n = x_grid.shape[0]
    y = np.zeros(n, dtype=float)
    y[0] = float(y0)

    # Teaching print: simulation setup.
    print(f"ode_rk4: n_steps={n - 1}, y0={y0}")
    print(f"  x range: [{x_grid[0]}, {x_grid[-1]}]")

    for i in range(n - 1):
        x_i = float(x_grid[i])
        y_i = float(y[i])
        h = float(x_grid[i + 1] - x_i)

        # Four RK4 slope estimates: anchor, two midpoints, endpoint.
        k1 = f(x_i,           y_i)
        k2 = f(x_i + 0.5 * h, y_i + 0.5 * h * k1)
        k3 = f(x_i + 0.5 * h, y_i + 0.5 * h * k2)
        k4 = f(x_i + h,       y_i + h * k3)

        y[i + 1] = y_i + (h / 6.0) * (k1 + 2.0 * k2 + 2.0 * k3 + k4)

        # Teaching print: log the first few steps so the recurrence is visible.
        if i < 3 or i == n - 2:
            print(
                f"  step {i:4d}: x={x_i:.4f} h={h:.4f} "
                f"k1={k1:.4f} k4={k4:.4f} y_next={y[i + 1]:.6f}"
            )

    print(f"ode_rk4: y[-1] = {y[-1]:.6g}")
    return y


# --- BETA 4.3 demo --------------------------------------------------------
# After implementing ode_rk4, here is a worked example: a damped pendulum
# integrated as a 2D state (theta, omega), visualized with robotics_sim.
# Run this file to see the animation captured by the Pyodide worker.
def _demo_damped_pendulum():
    import robotics_sim

    g = 9.81       # m/s^2
    L = 1.0        # m
    b = 0.3        # damping coefficient (1/s)
    theta0 = 1.0   # initial angle (rad) — roughly 57 degrees
    omega0 = 0.0   # initial angular velocity (rad/s)

    # State vector y = [theta, omega]. We integrate each component separately
    # by piggy-backing on the scalar ode_rk4 with a small wrapper. To stay
    # faithful to the scalar API, we hand-roll the loop here using the same
    # RK4 recurrence as ode_rk4, just on a 2D state.
    dt = 0.02
    n_steps = 400
    t = np.arange(n_steps + 1) * dt

    theta = np.zeros(n_steps + 1)
    omega = np.zeros(n_steps + 1)
    theta[0] = theta0
    omega[0] = omega0

    def deriv(_t, state):
        th, om = state
        return np.array([om, -(g / L) * np.sin(th) - b * om])

    for i in range(n_steps):
        s = np.array([theta[i], omega[i]])
        k1 = deriv(t[i],            s)
        k2 = deriv(t[i] + 0.5 * dt, s + 0.5 * dt * k1)
        k3 = deriv(t[i] + 0.5 * dt, s + 0.5 * dt * k2)
        k4 = deriv(t[i] + dt,       s + dt * k3)
        s_next = s + (dt / 6.0) * (k1 + 2 * k2 + 2 * k3 + k4)
        theta[i + 1] = s_next[0]
        omega[i + 1] = s_next[1]

    # The Pyodide worker tracks the FuncAnimation on construction.
    robotics_sim.animate_pendulum(theta, dt=dt, length=L)


_demo_damped_pendulum()
