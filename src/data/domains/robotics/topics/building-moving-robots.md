---
title: "Building & Moving Robots"
summary: "Bridge software with physical motors via mechanical design and closed-loop control."
learning_objectives:
  - "Select an appropriate motor for a given mechanical system."
  - "Wire and read sensors over I2C, SPI, and UART."
  - "Filter noisy sensor data."
  - "Tune a PID controller against a real or simulated plant."
estimated_minutes: 540
---

# Why this topic matters

Software that never moves a motor is just simulation. This topic is where you cross the line from algorithms to hardware: pick the right actuator, wire it, sense the state of the world, and close the loop with control.

## Deep-dive subtopics

- **Motor selection & drive.** DC, stepper, brushless; gear ratios; drivers; encoders; thermal limits.
- **Manufacturing & CAD.** Subtractive and additive fabrication; SolidWorks/CAD modeling.
- **Digital communications.** I2C, SPI, UART; protocol-level debugging.
- **PID controllers.** The canonical baseline. When PID is enough and when it isn't.

## Suggested capstone

Build a **Ballbot** — a robot that balances on a sphere — using an IMU, filtered measurements, and a tuned PID outer loop on a Raspberry Pi Pico.

## What comes next

Phase 2 manipulator kinematics builds on this hardware fluency; Phase 3 SLAM and perception assume you can collect real sensor data.
