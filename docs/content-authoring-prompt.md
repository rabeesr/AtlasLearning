You are authoring content for Atlas, a personal learning OS organized as a knowledge graph of topics. Your job: turn raw lecture notes into a structured, pedagogically enhanced learning module for ONE topic. The output must follow the exact templates below — do not invent new sections, do not skip sections, do not change heading levels.

# Inputs

## Topic metadata (from curriculum.yaml)
```
{{paste the topic's YAML block from curriculum.yaml here — slug, name, description, difficulty, phase, branch, dependencies, estimated_minutes}}
```

## Prerequisite topic summaries (1-line each, so you can write the prerequisites_recap honestly)
```
{{paste 1-line summaries of each dependency topic, or write "none" if the topic has no prerequisites}}
```

## Raw lecture notes (the source material — DO NOT copy verbatim)
```
{{paste the lecture notes / source material here. Can be messy, can be long.}}
```

# What you are doing (the method)

1. **Decompose** the lecture notes into atomic concepts. Each atomic concept is a single idea that could stand on its own as a flashcard. Aim for 4–8 atomic concepts per topic.
2. **Reframe** from "what was said in the lecture" to "what the learner needs to understand." Cut filler, examples specific to one lecture moment, and asides. Reorder freely.
3. **Enrich** with the things lecture notes almost never include:
   - A plain-language *mental model* before any formalism
   - At least one fully worked end-to-end *example* with concrete numbers, code, or a diagram (mermaid is fine)
   - A *common pitfalls* section — real misconceptions a beginner has, why they're wrong, and the correct framing
4. **Cross-link** by populating prerequisites_recap (what to remember from each prereq) and Connections (builds-on / feeds-into).
5. **Generate practice content** — self-check questions in the .md (no answers), and matching answer keys in the quizzes file, and atomic flashcards (one per Key Concept, plus extras for any term worth memorizing).

# Hard rules

- The lecture notes are *input only*. Never paste raw sentences from them. Always rewrite.
- Use the EXACT section headings shown below in the EXACT order. No extra H2s.
- Markdown rendering is GitHub-Flavored Markdown via react-markdown + remark-gfm. Tables, fenced code, task lists, mermaid blocks all work.
- Bold the term being defined inside Key Concepts (`**Eigenvector** — ...`).
- Each Key Concept body ≤ 150 words.
- Self-check questions: 5–10 items, mix of recall, application, and "explain why" questions. NUMBERED list. NO answers in the .md.
- Every self-check question must have a matching item in the quizzes YAML with the same id (`q1`, `q2`, ...).
- Every Key Concept must have at least one matching flashcard. Add extras for atomic facts/terms worth memorizing.
- Estimated_minutes: keep the value from the input metadata unless the lecture notes clearly imply otherwise.
- If the lecture notes don't cover something a section needs (e.g., no pitfalls discussed), generate it from your own knowledge of the field — but stay consistent with the level (difficulty field) of the topic.

# Output format

Return EXACTLY three fenced code blocks in this order, with the language tags shown. No prose before, between, or after.

## File 1 — save to `src/data/domains/{domain}/topics/{slug}.md`

```markdown
---
title: "<topic name, title case>"
summary: "<1–2 sentences. Concrete, no filler. Used in topic cards.>"
learning_objectives:
  - "<action-verb objective: implement / derive / explain / build / reason about ...>"
  - "<3–6 total>"
estimated_minutes: <integer>
prerequisites_recap:
  - "<from prereq X: the one thing they need to remember>"
  - "<one bullet per prereq topic; omit the field entirely if no prereqs>"
sources:
  - "<citation of the lecture notes — course, lecture #, professor, or URL>"
---

## Why this matters

<1–2 paragraphs. Anchor the topic in something concrete: a robot behavior, a real failure mode, a system the learner will eventually build. No formalism here.>

## Mental model

<One paragraph. The core intuition in plain words BEFORE any equations or jargon. If a smart friend asked "what's the big idea?", this is your answer.>

## Key concepts

### <Concept 1 name>

**<Term>** — <one-line definition>.

<Expansion: ≤150 words. Why it exists, when it applies, how to think about it. Inline math/code as needed.>

### <Concept 2 name>

**<Term>** — <one-line definition>.

<Expansion.>

<Repeat for 4–8 concepts total.>

## Worked example

<Full end-to-end walkthrough with concrete numbers, code, or a diagram. Show the work, not just the result. If multiple examples are needed, use ### Example 1, ### Example 2 subheadings.>

## Common pitfalls

- **<The misconception, stated as a learner would think it>.** <Why it's wrong.> <The correct framing.>
- **<Pitfall 2>.** <Why wrong.> <Correct framing.>
- <3–6 pitfalls total>

## Self-check

1. <Recall question>
2. <Application question — "given X, compute Y" or "given scenario, what happens?">
3. <Explain-why question>
4. <...>
5. <5–10 questions total. NO ANSWERS HERE.>

## Connections

- **Builds on:** [<prereq topic name>](../<prereq-slug>/learn) — <one line on what's reused>
- **Feeds into:** [<next topic name>](../<next-slug>/learn) — <one line on what this enables>
```

## File 2 — save to `src/data/domains/{domain}/quizzes/{slug}.yaml`

```yaml
topic: <slug>
items:
  - id: q1
    prompt: "<exact text of self-check question 1>"
    type: short_answer
    answer: "<the model answer, 1–3 sentences>"
    rubric:
      - "<key point a correct answer must hit>"
      - "<key point 2>"
    difficulty: <beginner|intermediate|advanced>
  - id: q2
    prompt: "<exact text of self-check question 2>"
    type: <short_answer|multiple_choice|code>
    # if multiple_choice, include:
    # choices: ["A", "B", "C", "D"]
    # answer: "B"
    # explanation: "<why B, why not the others>"
    answer: "<...>"
    difficulty: <...>
  # one item per self-check question, ids matching q1..qN
```

## File 3 — save to `src/data/domains/{domain}/flashcards/{slug}.yaml`

```yaml
topic: <slug>
cards:
  - id: c1
    front: "<short prompt — a question or 'Define X'>"
    back: "<short answer, 1–2 sentences max — flashcards are atomic>"
    tags: [<concept-name-kebab>]
  - id: c2
    front: "<...>"
    back: "<...>"
    tags: [<...>]
  # at least one card per Key Concept; add more for atomic terms/facts worth memorizing
  # aim for 8–15 cards total
```
