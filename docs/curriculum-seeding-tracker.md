# Curriculum Seeding Tracker

Last updated: 2026-04-29

## Topic Coverage

| Topic slug | Title | Seed status | Topic page | Source coverage | Notes |
| --- | --- | --- | --- | --- | --- |
| mathematics-foundations | Mathematics Foundations | seeded | not started | partial | Broad parent node only; add integrated overview markdown later. |
| linear-algebra-robotics | Linear Algebra for Robotics | seeded | drafted | covered | Initial topic page created from seed material. |
| calculus-robotics | Calculus for Robotics | seeded | not started | missing | Needs content and supporting source linkage. |
| probability-statistics | Probability and Statistics | seeded | not started | missing | Will matter for perception and estimation later. |
| control-theory | Control Theory | seeded | not started | partial | Parent node only; add overview once more sources arrive. |
| feedback-loops | Feedback Loops | seeded | not started | missing | Good candidate for first extracted lecture content. |
| pid-controllers | PID Controllers | seeded | drafted | partial | Seed markdown exists and should become first challenge/quiz anchor. |
| kinematics-dynamics | Kinematics and Dynamics | seeded | not started | partial | Parent node only. |
| forward-kinematics | Forward Kinematics | seeded | not started | partial | Strong candidate for early challenge content. |
| inverse-kinematics | Inverse Kinematics | seeded | not started | partial | Depends on fuller kinematics coverage first. |

## Source Ingestion Backlog

| Source | Type | Parser status | Linked topics | Next action |
| --- | --- | --- | --- | --- |
| University of Michigan Robotics Online Courses | article | covered_by_existing_parser | mathematics-foundations, control-theory, kinematics-dynamics | Continue using as the high-level curriculum seed. |
| Modern Robotics reference material | article | covered_by_existing_parser | linear-algebra-robotics, forward-kinematics, inverse-kinematics | Distill sections into topic markdown and examples. |
| Incoming lecture slide decks | powerpoint | needs_new_parser | pid-controllers, probability-statistics | Create a PowerPoint extraction workflow when the first deck is added. |

## Seeding Rules

- Every new curriculum node needs a stable slug before content work starts.
- Every new raw source must have a manifest entry.
- If extraction tooling is unclear, mark `needs_new_parser` immediately rather than burying the decision in notes.
