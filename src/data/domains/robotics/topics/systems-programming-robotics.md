---
title: "Systems Programming for Robotics"
summary: "Low-level, latency-free programming. Real-world robotics cannot rely on garbage-collected languages for safety-critical loops."
learning_objectives:
  - "Operate confidently in Linux/Bash and Git."
  - "Write correct C with manual memory management."
  - "Reason about and debug multithreaded programs."
  - "Use GDB, Valgrind, and AddressSanitizer to diagnose real bugs."
estimated_minutes: 480
---

# Why this topic matters

Robotics control loops run at hundreds or thousands of Hz with hard real-time constraints. Garbage collection pauses, hidden allocations, and unchecked race conditions are how autonomous systems crash. Systems programming teaches you to see — and fix — these problems before they reach hardware.

## Deep-dive subtopics

- **Linux, Bash, Git.** The day-to-day environment of a robotics engineer.
- **Deep C.** Pointer arithmetic, manual memory management, undefined behavior.
- **Multithreading.** Mutexes, condition variables, deadlock prevention, the C++ memory model.
- **Debugging tools.** GDB, Valgrind, AddressSanitizer, ThreadSanitizer.

## What comes next

Every Phase-2 and Phase-3 topic assumes you can write, compile, and debug a non-trivial native program.
