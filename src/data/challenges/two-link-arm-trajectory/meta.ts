import type { CodingChallenge } from "@/types/practice";

const meta: Partial<CodingChallenge> = {
  slug: "two-link-arm-trajectory",
  title: "Drive a Two-Link Arm Along a Velocity Profile",
  summary:
    "Integrate a joint-velocity profile and apply forward kinematics to drive a planar 2-link arm — calculus and kinematics in one challenge, with an animated arm in the reveal.",
  topicSlugs: [
    "calculus-robotics",
    "linear-algebra-robotics",
    "limits-integration",
  ],
  difficulty: "intermediate",
  estimatedMinutes: 60,
  hints: [
    "Build q_history one row at a time. The trapezoidal rule averages consecutive velocity samples: q[i+1] = q[i] + dt/2 * (qdot[i] + qdot[i+1]).",
    "Theta2 is measured relative to link 1, so the world-frame angle of link 2 is theta1 + theta2. That is the angle you feed into cos/sin for the elbow contribution.",
    "Forward kinematics: x = L1*cos(theta1) + L2*cos(theta1+theta2). The y component mirrors it with sin.",
  ],
};

export default meta;
