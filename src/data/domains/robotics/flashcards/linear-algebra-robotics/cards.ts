import type { Flashcard } from "@/types/practice";

/**
 * Linear-algebra-for-robotics deck (20 cards).
 *
 * Authoring conventions (see `.claude/skills/generate-flashcards/SKILL.md`):
 *   - Each front is a recall PROMPT, not a definition lookup.
 *   - Robotics framing wherever natural (sensors, joints, kinematics, control).
 *   - KaTeX math via `$...$` and `$$...$$`.
 *   - Backs end with a 1-line "why it matters" tie-back to the topic.
 */
export const cards: Flashcard[] = [
  {
    id: "la-001",
    topicSlug: "linear-algebra-robotics",
    front:
      "A LiDAR returns the point $p_C = (2,\\,0,\\,0)$ in the camera frame. The camera is rotated $90^{\\circ}$ about $+z$ relative to the base. Compute $p_B = R_z(90^{\\circ})\\,p_C$.",
    back:
      "$R_z(90^{\\circ}) = \\begin{bmatrix} 0 & -1 & 0\\\\ 1 & 0 & 0\\\\ 0 & 0 & 1\\end{bmatrix}$, so $p_B = (0,\\,2,\\,0)$.\n\nWhy it matters: every sensor reading must be lifted into the robot's base frame before a planner can use it.",
    formula: "R_z(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta & 0 \\\\ \\sin\\theta & \\cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}",
  },
  {
    id: "la-002",
    topicSlug: "linear-algebra-robotics",
    front:
      "State the three properties that make $R \\in \\mathrm{SO}(3)$ a rotation matrix (not just any orthogonal matrix).",
    back:
      "$R^\\top R = I$, $RR^\\top = I$, and $\\det(R) = +1$.\n\nThe determinant constraint rules out reflections — a roboticist needs orientation-preserving transforms, otherwise a left-handed frame appears mid-pipeline.",
  },
  {
    id: "la-003",
    topicSlug: "linear-algebra-robotics",
    front:
      "Why is $R^{-1} = R^\\top$ for $R \\in \\mathrm{SO}(3)$, and why does that matter on an embedded controller?",
    back:
      "Orthonormality gives $R^\\top R = I$, so the transpose IS the inverse — no division, no $O(n^3)$ solve, and numerically exact.\n\nWhy it matters: un-rotating a vector on a real-time loop costs you a memory transpose, not a `numpy.linalg.inv` call.",
  },
  {
    id: "la-004",
    topicSlug: "linear-algebra-robotics",
    front:
      "Given $u = (1,\\,2,\\,0)$ and $v = (0,\\,3,\\,4)$ (joint axis and end-effector offset, both meters), compute $u \\cdot v$ and state the geometric meaning.",
    back:
      "$u \\cdot v = 1\\cdot 0 + 2\\cdot 3 + 0\\cdot 4 = 6$.\n\nGeometric meaning: $u \\cdot v = \\lVert u\\rVert\\,\\lVert v\\rVert\\cos\\theta$ — the projected length of $v$ along $u$. Why it matters: torque about a fixed axis is the dot product of the force-arm cross product with that axis.",
    formula: "u \\cdot v = \\sum_i u_i v_i = \\lVert u\\rVert\\,\\lVert v\\rVert \\cos\\theta",
  },
  {
    id: "la-005",
    topicSlug: "linear-algebra-robotics",
    front:
      "A robot wrist applies force $F = (0,\\,0,\\,10)\\,\\mathrm{N}$ at offset $r = (0.2,\\,0,\\,0)\\,\\mathrm{m}$ from the joint. Compute the torque $\\tau = r \\times F$ and state its direction.",
    back:
      "$\\tau = r \\times F = (0\\cdot 10 - 0\\cdot 0,\\;0\\cdot 0 - 0.2\\cdot 10,\\;0\\cdot 0 - 0\\cdot 0) = (0,\\,-2,\\,0)\\,\\mathrm{N\\cdot m}$.\n\nDirection is $-\\hat y$ (right-hand rule). Why it matters: cross products are how every static-equilibrium analysis of an arm is written.",
    formula: "r \\times F = \\begin{bmatrix} r_y F_z - r_z F_y \\\\ r_z F_x - r_x F_z \\\\ r_x F_y - r_y F_x \\end{bmatrix}",
  },
  {
    id: "la-006",
    topicSlug: "linear-algebra-robotics",
    front:
      "What is the rank of $A = \\begin{bmatrix} 1 & 2\\\\ 2 & 4\\\\ 3 & 6 \\end{bmatrix}$, and what does it tell you about $Ax = b$?",
    back:
      "$\\text{rank}(A) = 1$ — column 2 is $2\\times$ column 1. So $Ax = b$ either has no solution (if $b$ leaves $\\text{col}(A)$) or infinitely many.\n\nWhy it matters: rank deficiency in a Jacobian = the manipulator has just lost a controllable direction (a kinematic singularity).",
  },
  {
    id: "la-007",
    topicSlug: "linear-algebra-robotics",
    front:
      "Describe the null space $\\mathcal N(A)$ in one sentence, then state what $\\mathcal N(J)$ means for a 7-DOF redundant arm with task Jacobian $J$.",
    back:
      "$\\mathcal N(A) = \\{x : Ax = 0\\}$ — directions that $A$ flattens to the origin.\n\nFor a redundant arm, $\\mathcal N(J)$ is the set of joint velocities that move the joints but leave the end-effector still. Why it matters: it's the room you have for secondary objectives (avoid joint limits, dodge obstacles) without disturbing the task.",
  },
  {
    id: "la-008",
    topicSlug: "linear-algebra-robotics",
    front:
      "Derive the normal equations for the least-squares problem $\\min_x \\lVert Ax - b\\rVert^2$ (tall, full column-rank $A$).",
    back:
      "Set $\\nabla_x \\lVert Ax - b\\rVert^2 = 2A^\\top(Ax - b) = 0$, giving $A^\\top A x = A^\\top b$.\n\nWhy it matters: this is the fitting step inside IMU bias estimation, hand-eye calibration, and every linear regression in robotics — but in practice use QR / SVD, not $(A^\\top A)^{-1}$, for numerical stability.",
    formula: "A^\\top A\\, x^* = A^\\top b",
  },
  {
    id: "la-009",
    topicSlug: "linear-algebra-robotics",
    front:
      "Given a tall $A \\in \\mathbb R^{m\\times n}$ with $m > n$, state the least-squares solution using its QR decomposition $A = QR$.",
    back:
      "$Rx = Q^\\top b$, solved by back-substitution.\n\nWhy it matters: QR is the workhorse stable solver — no $A^\\top A$, no condition-number squaring. This is what `numpy.linalg.lstsq` does under the hood.",
  },
  {
    id: "la-010",
    topicSlug: "linear-algebra-robotics",
    front:
      "State the eigenvalue equation, then explain in one sentence what it means physically for the rotation matrix $R_z(\\theta)$.",
    back:
      "$Av = \\lambda v$ — a non-zero direction $v$ that $A$ only scales (does not rotate or skew).\n\nFor $R_z(\\theta)$, the eigenvector $v = \\hat z$ has eigenvalue $1$ — the axis of rotation. Why it matters: the axis of any 3D rotation IS the real eigenvector with eigenvalue 1.",
    formula: "Av = \\lambda v",
  },
  {
    id: "la-011",
    topicSlug: "linear-algebra-robotics",
    front:
      "Compute the eigenvalues of $A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 3 \\end{bmatrix}$. (Triangular shortcut allowed.)",
    back:
      "For any triangular matrix, eigenvalues are the diagonal entries: $\\lambda_1 = 2,\\ \\lambda_2 = 3$.\n\nWhy it matters: state-space stability analysis reduces to reading eigenvalues off the system matrix — for a discretized controller, all $\\lvert\\lambda_i\\rvert < 1$ means stable.",
  },
  {
    id: "la-012",
    topicSlug: "linear-algebra-robotics",
    front:
      "What is the condition number $\\kappa(A)$, and why does $\\kappa(J) \\gg 1$ scream danger to a roboticist holding a manipulator Jacobian?",
    back:
      "$\\kappa(A) = \\sigma_{\\max}(A)/\\sigma_{\\min}(A)$ — ratio of largest to smallest singular value.\n\nFor a Jacobian: $\\kappa(J) \\gg 1$ means inverting it amplifies tiny measurement noise into huge joint velocities. Why it matters: it's the early warning for an imminent kinematic singularity.",
    formula: "\\kappa(A) = \\sigma_{\\max}(A)/\\sigma_{\\min}(A)",
  },
  {
    id: "la-013",
    topicSlug: "linear-algebra-robotics",
    front:
      "State the SVD $A = U\\Sigma V^\\top$ in words: what do $U$, $\\Sigma$, $V$ each represent geometrically?",
    back:
      "Any linear map $A$ is: rotate by $V^\\top$, scale axes by $\\Sigma$'s singular values, rotate by $U$.\n\nWhy it matters: SVD is the universal diagnostic — rank, null space, condition number, and pseudo-inverse all read off $\\Sigma$. PCA on sensor data, point-cloud alignment, and robust pinv all rest on it.",
    formula: "A = U\\Sigma V^\\top",
  },
  {
    id: "la-014",
    topicSlug: "linear-algebra-robotics",
    front:
      "Given the SVD $A = U\\Sigma V^\\top$, write the Moore-Penrose pseudo-inverse $A^{+}$ and state when you'd use it instead of $A^{-1}$.",
    back:
      "$A^{+} = V\\Sigma^{+}U^\\top$, where $\\Sigma^{+}$ inverts non-zero singular values and zeros the rest.\n\nUse it when $A$ is non-square or singular — exactly the case for a non-square Jacobian. Why it matters: $\\dot q = J^{+}\\dot p$ is the closed-form minimum-norm joint velocity for a given task-space velocity.",
    formula: "A^{+} = V\\Sigma^{+}U^\\top",
  },
  {
    id: "la-015",
    topicSlug: "linear-algebra-robotics",
    front:
      "An IMU outputs $a_{\\text{meas}} = R\\,a_{\\text{world}} + b$. Given $N$ samples while the IMU is stationary, set up the least-squares problem for the bias $b \\in \\mathbb R^3$.",
    back:
      "While stationary, $a_{\\text{world}} = (0,0,g)$ is known. Stack $N$ readings and solve $\\min_b \\sum_i \\lVert a_i - R_i (0,0,g)^\\top - b\\rVert^2$, i.e. $b = \\tfrac{1}{N}\\sum_i (a_i - R_i g\\hat z)$.\n\nWhy it matters: every IMU you've ever used was calibrated this way at boot.",
  },
  {
    id: "la-016",
    topicSlug: "linear-algebra-robotics",
    front:
      "Write the homogeneous transform $T \\in \\mathrm{SE}(3)$ as a block matrix, and explain why we stack rotation and translation this way.",
    back:
      "$T = \\begin{bmatrix} R & t \\\\ 0^\\top & 1 \\end{bmatrix} \\in \\mathbb R^{4\\times 4}$, applied to $[x,y,z,1]^\\top$.\n\nWhy it matters: chaining frames (sensor → wrist → arm → base) becomes a single matrix product $T_{B,S} = T_{B,W} T_{W,A} T_{A,S}$ — composition by multiplication is the entire reason for the homogeneous trick.",
    formula: "T = \\begin{bmatrix} R & t \\\\ 0^\\top & 1 \\end{bmatrix}",
  },
  {
    id: "la-017",
    topicSlug: "linear-algebra-robotics",
    front:
      "Why is $T^{-1} \\neq T^\\top$ for a homogeneous transform, and what IS the closed form for $T^{-1}$?",
    back:
      "The translation block breaks orthogonality of the full 4×4. Closed form: $T^{-1} = \\begin{bmatrix} R^\\top & -R^\\top t \\\\ 0^\\top & 1 \\end{bmatrix}$.\n\nWhy it matters: don't call `inv()` on a homogeneous transform — that closed form is faster and exact.",
    formula: "T^{-1} = \\begin{bmatrix} R^\\top & -R^\\top t \\\\ 0^\\top & 1 \\end{bmatrix}",
  },
  {
    id: "la-018",
    topicSlug: "linear-algebra-robotics",
    front:
      "Two vectors $u,v \\in \\mathbb R^3$ are orthonormal. What is the third vector $w$ that completes a right-handed orthonormal frame, and why is that frame useful?",
    back:
      "$w = u \\times v$ (right-hand rule, automatically unit-length since $u\\perp v$ and both unit).\n\nWhy it matters: this is exactly how you build a body-fixed frame from two measured axes (e.g., gravity from an accelerometer + magnetic north from a magnetometer) → orientation estimate.",
  },
  {
    id: "la-019",
    topicSlug: "linear-algebra-robotics",
    front:
      "Define a positive-definite matrix and state why robot inertia matrices $M(q)$ must be positive-definite.",
    back:
      "Symmetric $M$ with $x^\\top M x > 0$ for all $x \\ne 0$. Equivalent to: all eigenvalues positive.\n\nWhy it matters: kinetic energy is $\\tfrac{1}{2}\\dot q^\\top M(q)\\dot q$ — if $M$ weren't PD, you could find a motion with zero or negative kinetic energy, which is unphysical. Real inertia matrices satisfy this by construction.",
  },
  {
    id: "la-020",
    topicSlug: "linear-algebra-robotics",
    front:
      "For an overdetermined sensor-fusion problem $Ax \\approx b$ with $A \\in \\mathbb R^{m\\times n}$, $m > n$, why is solving the normal equations $A^\\top A x = A^\\top b$ numerically worse than QR?",
    back:
      "$\\kappa(A^\\top A) = \\kappa(A)^2$. Forming $A^\\top A$ literally squares the conditioning, so you lose half your significant digits to rounding before you even start the solve.\n\nWhy it matters: in real numerical pipelines, fuse with QR or SVD. The normal equations are a teaching tool, not a production solver.",
  },
];
