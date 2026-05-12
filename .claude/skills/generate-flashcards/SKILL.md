---
name: generate-flashcards
description: Generate a robotics-framed flashcard deck (TypeScript `Flashcard[]`) for an AtlasLearning topic. Outputs `src/data/domains/robotics/flashcards/<topic_slug>/cards.ts`. Use when the user asks to "create flashcards for <topic>", "add a flashcard deck", or "scaffold cards for <topic_slug>".
---

# Generate a Flashcard Deck

This skill authors one deck of recall-prompt flashcards, persisted as a TypeScript module the existing flashcard runner already imports.

## Inputs

Before generating anything, confirm:

1. **`topic_slug`** — must already exist in `src/data/domains/robotics/curriculum.yaml`. Example: `linear-algebra-robotics`, `calculus-robotics`.
2. **`count`** — number of cards, default **20**.
3. (Optional) **`concept_focus`** — one or two narrower areas to weight toward (e.g. "Jacobians, eigenvectors"). If omitted, span the topic's full subtopic list.

If the brief is fuzzy, restate it ("20 cards on `calculus-robotics`, weighted toward integration applications") and confirm.

## Output

Single file: `src/data/domains/robotics/flashcards/<topic_slug>/cards.ts`.

Shape:

```ts
import type { Flashcard } from "@/types/practice";

export const cards: Flashcard[] = [
  {
    id: "<prefix>-001",
    topicSlug: "<topic_slug>",
    front: "...",
    back: "...",
    formula: "...",   // optional pure-KaTeX
    mnemonic: "...",  // optional one-liner
  },
  // ...
];
```

The `Flashcard` type is defined in `src/types/practice.ts`:

```ts
export interface Flashcard {
  id: string;
  topicSlug: string;
  front: string;
  back: string;
  formula?: string;
  mnemonic?: string;
}
```

`id` convention: two-letter topic prefix + zero-padded index. `linear-algebra-robotics` uses `la-NNN`; `calculus-robotics` uses `ca-NNN`. Pick a short prefix that won't collide.

## Authoring rules

- **Front is a recall PROMPT, not a definition lookup.** Bad: "What is a Jacobian?" Good: "A 2-DOF arm has joints at `theta1, theta2` and link lengths `L1, L2`. Derive the Jacobian `J(theta)` of the end-effector position."
- **Robotics framing whenever natural.** Encoder ticks -> wheel velocity. Joint torques -> static equilibrium. IMU samples -> heading drift. Sensor frame -> base frame. The card should make the learner feel a real scenario before doing the math.
- **Units everywhere.** rad, rad/s, N, m, kg*m^2, A, V, K. Put them in the prompt, in the answer, and in the "why it matters" tag.
- **Back is answer + 1-line tie-back.** End the back with a single line that names *why a roboticist cares*: "Why it matters: every sensor reading must be lifted into the base frame before a planner can use it."
- **KaTeX math.** Use `$...$` inline and `$$...$$` block. Already supported by `topic-markdown.tsx`. Escape backslashes inside string literals (`\\theta`, `\\begin{bmatrix}`).
- **No trick questions.** A card should fail only when the *concept* is not held, never when the *wording* is misread.
- **Mix difficulty.** Roughly 30% recall-of-definition prompts (still framed as "state the precise condition for..."), 50% one-step derivations or computations, 20% conceptual ("why does X imply Y for a real-time controller?").
- **No duplicate ids, no duplicate prompts.**

## Worked example (one card from the linear-algebra deck)

```ts
{
  id: "la-001",
  topicSlug: "linear-algebra-robotics",
  front:
    "A LiDAR returns the point $p_C = (2,\\,0,\\,0)$ in the camera frame. The camera is rotated $90^{\\circ}$ about $+z$ relative to the base. Compute $p_B = R_z(90^{\\circ})\\,p_C$.",
  back:
    "$R_z(90^{\\circ}) = \\begin{bmatrix} 0 & -1 & 0\\\\ 1 & 0 & 0\\\\ 0 & 0 & 1\\end{bmatrix}$, so $p_B = (0,\\,2,\\,0)$.\n\nWhy it matters: every sensor reading must be lifted into the robot's base frame before a planner can use it.",
  formula: "R_z(\\theta) = \\begin{bmatrix} \\cos\\theta & -\\sin\\theta & 0 \\\\ \\sin\\theta & \\cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{bmatrix}",
},
```

Read `src/data/domains/robotics/flashcards/linear-algebra-robotics/cards.ts` end-to-end before writing a new deck.

## Verification

Before reporting done:

1. `npm run build` — catches TypeScript and KaTeX parse errors in one shot.
2. Manually skim for duplicate ids and missing "why it matters" lines.

If `npm run build` flags a KaTeX parse error, the offender is almost always an unescaped backslash inside a TS string. Double them.

## When done

Report:
- Path to the new `cards.ts`.
- Number of cards and the rough split across subtopics.
- Any cards where the robotics framing felt forced (so the user can rewrite).
