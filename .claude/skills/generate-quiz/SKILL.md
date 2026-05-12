---
name: generate-quiz
description: Scaffold a new YAML quiz file for an AtlasLearning robotics topic at `src/data/domains/robotics/quizzes/<topic_slug>.yaml`, matching the schema parsed by `src/lib/content/quiz-content.ts`. Use when the user asks to "create a quiz for <topic>", "scaffold a quiz yaml", or "add quiz questions for <topic_slug>". This skill creates the FILE; content authoring is a separate pass.
---

# Generate a Quiz YAML

This skill creates the YAML container for a topic quiz. The parser is `src/lib/content/quiz-content.ts`. Existing decks at `src/data/domains/robotics/quizzes/linear-algebra-robotics.yaml` and `calculus-robotics.yaml` are the canonical examples.

## Inputs

1. **`topic_slug`** — must exist in `src/data/domains/robotics/curriculum.yaml`.
2. (Optional) **`count`** — target number of items. Default 10.
3. (Optional) **`difficulty_mix`** — e.g. `4 beginner / 4 intermediate / 2 advanced`. Default is `~40/40/20`.

## Output location

Exactly one file: `src/data/domains/robotics/quizzes/<topic_slug>.yaml`.

## Schema (from `src/lib/content/quiz-content.ts`)

The top-level YAML must be:

```yaml
topic: <topic_slug>     # string, must match filename. Falls back to filename if omitted.
items:
  - id: <unique-id>     # e.g. "q1"
    prompt: "..."       # string. Plain text or unicode math; KaTeX is NOT rendered here.
    type: <multiple_choice | short_answer | code>
    answer: "..."       # string. For multiple_choice, must equal one of `choices`.
    difficulty: <beginner | intermediate | advanced>   # default beginner if missing/invalid
    rubric:             # optional array of strings — scoring guidance
      - "..."
    # multiple_choice-only fields:
    choices:            # array of >=2 strings; MUST contain `answer`
      - "..."
    explanation: "..."  # optional, shown after reveal
```

Parser rules (from `parseQuestion`):

- `id`, `prompt`, `type`, `answer` are REQUIRED and must be strings. A missing field silently drops the question.
- For `multiple_choice`: `choices.length >= 2` AND `answer in choices` — otherwise the question is dropped.
- For `short_answer` and `code`: just `answer` as a free-form reference.
- `difficulty` falls back to `beginner` if missing or not in `{beginner, intermediate, advanced}`.
- Any other `type` value drops the question silently.

If `parsed.items` is missing or every item fails validation, `getQuizForTopic` returns `null` and the page renders nothing — silent failures are the norm, so verify locally.

## Authoring rules (apply when filling in content)

- **Robotics framing first.** Open every prompt with a scenario: "A quadrotor IMU samples at 200 Hz...". Then ask the question.
- **Units in the prompt and in the answer.** rad, rad/s, N, m, kg*m^2, A, V, K.
- **Distractors test specific misconceptions** (sign error, transposed matrix, dropped factor of 2, wrong axis). One distractor should be the correct number with wrong units when units are the lesson.
- **No trick questions.** The mistake a learner makes should be conceptual, not lexical.
- **`explanation`** on `multiple_choice` should explain *why the correct answer is correct AND why the most likely wrong choice is wrong*. One sentence each.
- **`rubric`** on `short_answer` is a 2-3 bullet list of what a full-credit answer must touch. The UI surfaces these on reveal.
- **`code` type**: prompt should request a short Python function; `answer` is the reference implementation as a string. The runner does NOT execute it — it's for self-grading. Keep it short (one function, ~10 lines).
- **`id`s are short and unique within the file.** `q1`, `q2`, ... is fine.

## Worked example

```yaml
topic: linear-algebra-robotics
items:
  - id: q4
    prompt: "A 4x4 homogeneous transform first rotates 90 deg about the z-axis and then translates by [1, 0, 0]. Apply it to the point [1, 0, 0, 1]^T. Where does the point end up?"
    type: multiple_choice
    choices:
      - "[1, 1, 0, 1]^T"
      - "[2, 0, 0, 1]^T"
      - "[0, 1, 0, 1]^T"
      - "[1, 0, 1, 1]^T"
    answer: "[1, 1, 0, 1]^T"
    explanation: "Rotation sends [1, 0, 0] -> [0, 1, 0]; translation by [1, 0, 0] then gives [1, 1, 0]. The [2, 0, 0] distractor swaps the order of rotation and translation."
    difficulty: intermediate
```

Read `linear-algebra-robotics.yaml` end-to-end before authoring real content.

## Verification

1. `npm run build` — catches YAML parse errors via the page build step.
2. `npm run dev`, open `/topics/<topic_slug>/quizzes/play` and confirm every item appears. If a question is silently missing, it failed `parseQuestion` — re-check the required fields and the `multiple_choice` constraints.

## Scope of this skill

This skill writes the **file with the schema in place** and (optionally) a few scaffolded item stubs. Authoring 20+ high-quality questions is a separate authoring pass — flag that to the user when handing off the file.

## When done

Report:
- Path to the new YAML.
- Number of item stubs written.
- Reminder that content authoring is the next step.
