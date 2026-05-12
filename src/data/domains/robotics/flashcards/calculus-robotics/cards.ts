import type { Flashcard } from "@/types/practice";

/**
 * Calculus-for-robotics deck (20 cards).
 *
 * Coverage: derivatives (definition, finite differences), gradients, chain rule
 * (Jacobian), partials, Taylor expansion (linearization), line integrals,
 * 1st- and 2nd-order ODEs, Lagrangian mechanics, Laplace-transform basics.
 *
 * Authoring conventions: see `.claude/skills/generate-flashcards/SKILL.md`.
 */
export const cards: Flashcard[] = [
  {
    id: "ca-001",
    topicSlug: "calculus-robotics",
    front:
      "Given encoder samples $\\theta_0 = 0.10,\\ \\theta_1 = 0.12,\\ \\theta_2 = 0.15$ at $\\Delta t = 0.01\\,\\mathrm{s}$, estimate $\\omega_1$ via central differences and state the assumption.",
    back:
      "$\\omega_1 \\approx \\dfrac{\\theta_2 - \\theta_0}{2\\Delta t} = \\dfrac{0.15 - 0.10}{0.02} = 2.5\\,\\mathrm{rad/s}$.\n\nAssumption: $\\theta(t)$ is smooth (twice-differentiable) on this window; the central difference cancels first-order error so it's $O(\\Delta t^2)$.\n\nWhy it matters: encoders give angles, controllers want velocities — finite differences bridge them every control tick.",
    formula: "\\omega_i \\approx \\frac{\\theta_{i+1} - \\theta_{i-1}}{2\\Delta t}",
  },
  {
    id: "ca-002",
    topicSlug: "calculus-robotics",
    front:
      "State the limit definition of the derivative and explain why forward differences ($O(\\Delta t)$) lose accuracy versus central differences ($O(\\Delta t^2)$).",
    back:
      "$f'(x) = \\lim_{h\\to 0}\\dfrac{f(x+h)-f(x)}{h}$. Forward diff has truncation error $\\tfrac{h}{2}f''(\\xi)$; central diff is symmetric so the $O(h)$ term cancels, leaving $-\\tfrac{h^2}{6}f'''(\\xi)$.\n\nWhy it matters: doubling the sample rate cuts central-diff noise 4×, but only 2× for forward — drives your sensor-loop design.",
    formula: "f'(x) = \\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}",
  },
  {
    id: "ca-003",
    topicSlug: "calculus-robotics",
    front:
      "Compute $\\nabla f$ for $f(x,y) = x^2 + 3xy + 2y^2$ and state what direction a gradient-descent step takes.",
    back:
      "$\\nabla f = (2x + 3y,\\ 3x + 4y)$.\n\nA descent step moves in $-\\nabla f$ — the direction of steepest decrease. Why it matters: every IK solver, every bundle-adjustment, every model-fit you'll write is a gradient step on a cost.",
  },
  {
    id: "ca-004",
    topicSlug: "calculus-robotics",
    front:
      "State the multivariable chain rule for $z = f(g(x))$ where $g: \\mathbb R^n \\to \\mathbb R^m$ and $f: \\mathbb R^m \\to \\mathbb R$. What does this become for a robot end-effector $p = f(q)$?",
    back:
      "$\\dfrac{\\partial z}{\\partial x_j} = \\sum_i \\dfrac{\\partial f}{\\partial g_i}\\dfrac{\\partial g_i}{\\partial x_j}$ — in matrix form: $\\dfrac{\\mathrm dz}{\\mathrm dx} = \\dfrac{\\mathrm df}{\\mathrm dg}\\,\\dfrac{\\mathrm dg}{\\mathrm dx}$.\n\nFor the arm: $\\dot p = J(q)\\,\\dot q$, where $J = \\partial f/\\partial q$ is the manipulator Jacobian. Why it matters: this IS the Jacobian's reason for existing.",
    formula: "\\dot p = J(q)\\,\\dot q",
  },
  {
    id: "ca-005",
    topicSlug: "calculus-robotics",
    front:
      "Write the manipulator Jacobian $J(q) \\in \\mathbb R^{m\\times n}$ entry-by-entry. What are its rows and columns?",
    back:
      "$J_{ij} = \\dfrac{\\partial p_i}{\\partial q_j}$.\n\nRows index task-space dimensions ($m$), columns index joints ($n$). Why it matters: this matrix maps joint velocities to end-effector velocities; its rank tells you about kinematic singularities.",
    formula: "J_{ij} = \\frac{\\partial p_i}{\\partial q_j}",
  },
  {
    id: "ca-006",
    topicSlug: "calculus-robotics",
    front:
      "Write the first-order Taylor expansion of $f$ about $x_0$ in $\\mathbb R^n$, and explain how it produces a linearized model around an operating point.",
    back:
      "$f(x) \\approx f(x_0) + \\nabla f(x_0)^\\top (x - x_0)$.\n\nWhy it matters: every linear controller you'll meet (LQR, Kalman) is built on linearizing a nonlinear plant around an operating point so the math becomes matrix math.",
    formula: "f(x) \\approx f(x_0) + \\nabla f(x_0)^\\top (x - x_0)",
  },
  {
    id: "ca-007",
    topicSlug: "calculus-robotics",
    front:
      "Apply Taylor expansion to derive the small-angle linearization of the pendulum equation $\\ddot\\theta + \\tfrac{g}{L}\\sin\\theta = 0$ near $\\theta = 0$.",
    back:
      "$\\sin\\theta = \\theta - \\tfrac{\\theta^3}{6} + \\dots \\approx \\theta$, so $\\ddot\\theta + \\tfrac{g}{L}\\theta = 0$ — a linear harmonic oscillator with $\\omega_n = \\sqrt{g/L}$.\n\nWhy it matters: this is why a balancing controller designed around the upright equilibrium can use plain LQR and still work.",
  },
  {
    id: "ca-008",
    topicSlug: "calculus-robotics",
    front:
      "Solve the first-order linear ODE $\\tau \\dot y + y = K u$ with $u$ constant and $y(0) = 0$. Identify $\\tau$ as a robot quantity.",
    back:
      "$y(t) = Ku\\,(1 - e^{-t/\\tau})$. The time constant $\\tau$ is the electrical / mechanical response time of the motor — how fast it tracks a step in input voltage.\n\nWhy it matters: every DC motor on the bench obeys this exact equation, and $\\tau$ is the spec the controller has to live with.",
    formula: "y(t) = Ku\\,(1 - e^{-t/\\tau})",
  },
  {
    id: "ca-009",
    topicSlug: "calculus-robotics",
    front:
      "Write the general second-order linear ODE for a mass-spring-damper, and state the three damping regimes by their relation to $\\zeta$.",
    back:
      "$m\\ddot x + c\\dot x + k x = F$. With $\\omega_n = \\sqrt{k/m}$ and $\\zeta = \\dfrac{c}{2\\sqrt{km}}$:\n\n- $\\zeta < 1$ underdamped (oscillates), $\\zeta = 1$ critical (fastest non-oscillatory), $\\zeta > 1$ overdamped (sluggish).\n\nWhy it matters: tuning a PD controller is choosing $\\zeta$ — you almost always target $\\zeta \\approx 0.7$ for a snappy non-overshooting response.",
    formula: "m\\ddot x + c\\dot x + k x = F",
  },
  {
    id: "ca-010",
    topicSlug: "calculus-robotics",
    front:
      "Convert the 2nd-order ODE $\\ddot x + 2\\zeta\\omega_n \\dot x + \\omega_n^2 x = u$ to state-space form $\\dot{\\mathbf s} = A\\mathbf s + Bu$.",
    back:
      "Let $\\mathbf s = (x,\\,\\dot x)^\\top$. Then\n$A = \\begin{bmatrix} 0 & 1 \\\\ -\\omega_n^2 & -2\\zeta\\omega_n\\end{bmatrix},\\ B = \\begin{bmatrix} 0\\\\ 1\\end{bmatrix}$.\n\nWhy it matters: state-space form is what RK4, LQR, and the Kalman filter all expect — converting from a single $n$-th-order ODE is the first step of any control design.",
  },
  {
    id: "ca-011",
    topicSlug: "calculus-robotics",
    front:
      "State the Euler step for $\\dot y = f(t, y)$ and explain why it can blow up on stiff systems.",
    back:
      "$y_{n+1} = y_n + h\\,f(t_n, y_n)$ — first-order accurate, conditionally stable.\n\nOn stiff systems the stability region is tiny; you need $h$ vanishingly small to keep the iteration bounded. Why it matters: explicit Euler is fine for slow plants but fails on a stiff motor model — use RK4 or an implicit scheme.",
    formula: "y_{n+1} = y_n + h\\,f(t_n, y_n)",
  },
  {
    id: "ca-012",
    topicSlug: "calculus-robotics",
    front:
      "Write the four RK4 slopes for $\\dot y = f(t,y)$ with step $h$, and the final update.",
    back:
      "$k_1 = f(t_n, y_n)$\n$k_2 = f(t_n + \\tfrac h2,\\ y_n + \\tfrac h2 k_1)$\n$k_3 = f(t_n + \\tfrac h2,\\ y_n + \\tfrac h2 k_2)$\n$k_4 = f(t_n + h,\\ y_n + h k_3)$\n\n$y_{n+1} = y_n + \\dfrac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)$\n\nWhy it matters: RK4 is the fixed-step workhorse — fourth-order accurate, stable enough for most robot dynamics, and what `solve_ivp(method='RK45')` falls back to.",
    formula: "y_{n+1} = y_n + \\frac{h}{6}(k_1 + 2k_2 + 2k_3 + k_4)",
  },
  {
    id: "ca-013",
    topicSlug: "calculus-robotics",
    front:
      "Define the line integral $\\int_C \\mathbf F \\cdot \\mathrm d\\mathbf r$. Compute the work done by gravity on a robot end-effector moving from $(0,0,0)$ to $(0,0,h)$ with $\\mathbf F = (0,0,-mg)$.",
    back:
      "$W = \\int_C \\mathbf F \\cdot \\mathrm d\\mathbf r = \\int_0^h (-mg)\\,\\mathrm dz = -mgh$.\n\nWhy it matters: motor torque profiles for pick-and-place are sized by the work done against gravity along the trajectory.",
    formula: "W = \\int_C \\mathbf F \\cdot \\mathrm d\\mathbf r",
  },
  {
    id: "ca-014",
    topicSlug: "calculus-robotics",
    front:
      "State the Euler-Lagrange equation. Apply it to the planar pendulum $L = \\tfrac{1}{2}mL^2\\dot\\theta^2 - mgL(1-\\cos\\theta)$.",
    back:
      "$\\dfrac{\\mathrm d}{\\mathrm dt}\\dfrac{\\partial L}{\\partial \\dot q} - \\dfrac{\\partial L}{\\partial q} = 0$.\n\nFor the pendulum: $\\dfrac{\\partial L}{\\partial \\dot\\theta} = mL^2\\dot\\theta$, $\\dfrac{\\partial L}{\\partial \\theta} = -mgL\\sin\\theta$, giving $mL^2\\ddot\\theta + mgL\\sin\\theta = 0$, or $\\ddot\\theta + \\tfrac{g}{L}\\sin\\theta = 0$.\n\nWhy it matters: Lagrangian mechanics derives manipulator dynamics $M(q)\\ddot q + C(q,\\dot q)\\dot q + g(q) = \\tau$ without ever drawing a free-body diagram.",
    formula: "\\frac{\\mathrm d}{\\mathrm dt}\\frac{\\partial L}{\\partial \\dot q} - \\frac{\\partial L}{\\partial q} = 0",
  },
  {
    id: "ca-015",
    topicSlug: "calculus-robotics",
    front:
      "State the Laplace transform of $f(t) = e^{-at}$, and state the Laplace pair for differentiation.",
    back:
      "$\\mathcal L\\{e^{-at}\\} = \\dfrac{1}{s + a}$. Differentiation: $\\mathcal L\\{\\dot f\\} = sF(s) - f(0)$.\n\nWhy it matters: the transfer function $G(s) = Y(s)/U(s)$ encodes a linear plant as a rational function — poles tell you stability at a glance.",
    formula: "\\mathcal L\\{\\dot f\\} = sF(s) - f(0)",
  },
  {
    id: "ca-016",
    topicSlug: "calculus-robotics",
    front:
      "Write the transfer function of the first-order motor $\\tau \\dot y + y = K u$ and identify its pole.",
    back:
      "Take Laplace (zero IC): $\\tau s Y + Y = KU$, so $G(s) = \\dfrac{Y}{U} = \\dfrac{K}{\\tau s + 1}$ with a single pole at $s = -1/\\tau$.\n\nWhy it matters: the pole's negative real part proves the open-loop system is stable. Closed-loop control re-places this pole to achieve a target time constant.",
    formula: "G(s) = \\frac{K}{\\tau s + 1}",
  },
  {
    id: "ca-017",
    topicSlug: "calculus-robotics",
    front:
      "Compute $\\dfrac{\\partial^2 f}{\\partial x\\, \\partial y}$ for $f(x,y) = x^2 y + \\sin(xy)$. Where does Clairaut's theorem let you check your answer?",
    back:
      "$\\dfrac{\\partial f}{\\partial y} = x^2 + x\\cos(xy)$, so $\\dfrac{\\partial^2 f}{\\partial x\\,\\partial y} = 2x + \\cos(xy) - xy\\sin(xy)$. Clairaut: $\\partial_{xy} = \\partial_{yx}$ when both are continuous — recompute as a self-check.\n\nWhy it matters: a Hessian's symmetry IS Clairaut. Newton-step IK and second-order optimizers rely on it.",
  },
  {
    id: "ca-018",
    topicSlug: "calculus-robotics",
    front:
      "An accelerometer gives $a(t)$. Write the integral that recovers position $x(t)$ from rest, and state the dominant error mode for long integrations.",
    back:
      "$v(t) = v(0) + \\int_0^t a(\\tau)\\mathrm d\\tau$, $x(t) = x(0) + \\int_0^t v(\\tau)\\mathrm d\\tau$.\n\nDominant error: any constant accelerometer bias $\\varepsilon$ integrates to $\\varepsilon t$ in $v$ and $\\tfrac{1}{2}\\varepsilon t^2$ in $x$ — quadratic drift. Why it matters: this is why inertial navigation NEEDS an absolute reference (GPS, vision).",
    formula: "x(t) = x(0) + \\int_0^t v(\\tau)\\,\\mathrm d\\tau",
  },
  {
    id: "ca-019",
    topicSlug: "calculus-robotics",
    front:
      "State the chain-rule formula for the time derivative of a rotation $R(t)$ expressed via an angular velocity $\\omega(t)$.",
    back:
      "$\\dot R = [\\omega]_\\times\\,R$, where $[\\omega]_\\times$ is the $3\\times3$ skew-symmetric cross-product matrix of $\\omega$.\n\nWhy it matters: this is the ODE you integrate (carefully — must re-orthonormalize or use a Lie-group integrator) to propagate IMU orientation.",
    formula: "\\dot R = [\\omega]_\\times\\,R",
  },
  {
    id: "ca-020",
    topicSlug: "calculus-robotics",
    front:
      "A PI controller has transfer function $C(s) = K_p + \\dfrac{K_i}{s}$. State each gain's role in tracking a step input, and the price the integrator charges.",
    back:
      "$K_p$ shrinks the immediate error; $K_i$ drives steady-state error to zero by integrating the residual.\n\nPrice: the integrator adds a pole at the origin → can introduce overshoot and integrator windup if the actuator saturates. Why it matters: every velocity loop on every motor in your robot has this exact controller.",
    formula: "C(s) = K_p + \\frac{K_i}{s}",
  },
];
