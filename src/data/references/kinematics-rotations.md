# Kinematics: rotation conventions

The hardest part of rigid-body kinematics is the bookkeeping. The math is just \(SO(3)\); the bugs come from conventions. This page is the dictionary.

## Right-hand rule, always

Across robotics, computer graphics, and physics, all standard rotation conventions are right-handed: positive rotation about an axis is counter-clockwise when looking *down* the axis toward the origin. If you find yourself negating an angle to make a simulation look right, you have almost certainly mixed in a left-handed convention from somewhere.

## Active vs. passive (alias vs. alibi)

- **Active** rotation: rotate the vector, frame stays put. \(v' = R v\).
- **Passive** rotation: rotate the frame, vector stays put. The new coordinates of the same vector are \(v' = R^\top v\).

Robotics typically uses **active** rotations for body motion ("rotate the gripper by 30°") and **passive** rotations for changing frames ("express this point in the camera frame"). When library docs say "the rotation matrix between frames A and B," ask which way: \(R^A_B\) means *expressing B-coordinates in A* (passive), so \(v_A = R^A_B \, v_B\).

## Composition order: body-frame vs. world-frame

If you apply \(R_1\) then \(R_2\) about **fixed (world) axes**, the combined rotation is \(R_2 R_1\) (right-to-left).

If you apply \(R_1\) then \(R_2\) about **body (moving) axes**, the combined rotation is \(R_1 R_2\) (left-to-right).

This is the single most common source of "but the math is right!" arguments.

## Euler angles: ZYX vs. XYZ

There is no universal Euler convention. Aerospace usually uses ZYX (yaw, pitch, roll) — heading first, then pitch, then bank. Robotics manipulators often use XYZ. The numerical values differ; the geometric rotation can be the same.

When importing a quaternion or rotation matrix and decomposing it back to Euler angles, you must pick the same convention as the producer, or you will see the gimbal-lock corners in different places.

## Quaternions

A unit quaternion \(q = [w, x, y, z]\) with \(w^2 + x^2 + y^2 + z^2 = 1\) represents the same rotation as a rotation matrix without singularities. Composition is \(q_2 q_1\) (Hamilton product). The conjugate \(q^*\) is the inverse rotation.

**Double cover:** \(q\) and \(-q\) represent the same rotation. SLERP can pick either; if it picks the wrong one, your interpolation takes the long way around. Always check \(\text{sign}(q_1 \cdot q_2)\) before SLERP and flip if negative.

## Skew-symmetric form of cross product

For \(\omega = [\omega_x, \omega_y, \omega_z]^\top\),
\[
[\omega]_\times = \begin{bmatrix} 0 & -\omega_z & \omega_y \\ \omega_z & 0 & -\omega_x \\ -\omega_y & \omega_x & 0 \end{bmatrix}, \qquad [\omega]_\times v = \omega \times v.
\]

This is how angular velocity propagates through rotation matrices: \(\dot R = [\omega]_\times R\) for body-frame \(\omega\), or \(\dot R = R [\omega]_\times\) for world-frame.

## How to debug a rotation bug

1. Identify whether your matrices are active or passive. Write it down on a sticky note.
2. Print the determinant of every rotation matrix. It should be \(+1\). If it's \(-1\), you have a reflection in there.
3. Verify \(R R^\top = I\). If not, you're not in \(SO(3)\) and need to project (use SVD-based projection).
4. Sanity-check 90° rotations about each axis by hand — if those are wrong, your code has a sign/transpose bug.
