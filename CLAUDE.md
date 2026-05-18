# CLAUDE.md — AtlasLearning Developer Guide

This file is the orientation doc for any LLM (Claude Code, Cursor, etc.) extending the AtlasLearning repo. Read it end-to-end before your first edit. It captures the *non-obvious* parts: how content flows, where the wiring is fragile, and which mistakes have already happened (so you don't repeat them).

## 1. Project shape in one paragraph

AtlasLearning is a Next.js 15 (App Router, React 19, Tailwind v4) personal learning OS for robotics. Auth is **Clerk**, persistence is **Supabase** (project ID `qndrkjcyrolywzrroadb`, with Clerk as a third-party JWT issuer — every RLS policy keys on `auth.jwt() ->> 'sub'`). Python code runs in the browser via **Pyodide** inside a Web Worker; **Monaco** is the editor. Content lives as files in `src/data/` (challenges, flashcards, quizzes, topic markdown) and gets composed into typed objects by **loader modules** in `src/lib/content/` and `src/lib/practice/`.

## 2. Content surfaces — the four primary kinds

| Surface | Source files | Loader | Renderer / route |
|---|---|---|---|
| **Topic markdown** (learn) | `src/data/domains/robotics/topics/<slug>.md` | `src/lib/content/topic-content.ts` (uses `topic-body-parser.ts` for `:::probe` blocks) | `/topics/[slug]/learn` |
| **Quizzes** | `src/data/domains/robotics/quizzes/<slug>.yaml` | `src/lib/content/quiz-content.ts` | `/topics/[slug]/quizzes/play` (uses `QuizPlayer`) |
| **Coding challenges** | `src/data/challenges/<slug>/{problem.md, starter.py, solution.py, tests.py, meta.ts}` | `src/lib/practice/challenge-repository.ts` (reads disk + parses tests.py) AND must be **registered** in `src/lib/practice/practice-repository.ts` | `/challenges/[slug]` (uses `ChallengeRunner` + Pyodide worker) |
| **Flashcards** | `src/data/domains/robotics/flashcards/<slug>/cards.ts` | `src/lib/content/flashcard-content.ts` (registered decks listed there) | `/review/flashcards?topic=<slug>` or `/topics/[slug]/flashcards` (uses `FlashcardRunner`) |

**Watch-out:** Coding challenges have **two registration points** — the on-disk directory AND the `practice-repository.ts` `ChallengeItem` entry. Adding only one will silently exclude the challenge from the `/challenges` index. Same for flashcard decks: the deck file exists *and* `flashcard-content.ts` must import it. Both content types must have entries in **both** places.

## 3. Skills — how to author content

Three Claude Code skills ship with the repo, mirrored at `.claude/skills/<name>/SKILL.md` (project-scoped) and `~/.claude/skills/<name>/SKILL.md` (user-global). Keep both in sync; the project-scoped copy is canonical.

| Skill | Trigger | What it does |
|---|---|---|
| `generate-coding-challenge` | "add a coding challenge", "scaffold a Pyodide challenge for <topic>" | Scaffolds the 5-file challenge directory, registers in `practice-repository.ts`, verifies solution against tests with `python3`. Every challenge must be framed as a believable robotics scenario (math, physics, chemistry, or engineering). |
| `generate-flashcards` | "create flashcards for <topic>", "scaffold cards for <slug>" | Generates `cards.ts` with 15–20 robotics-framed recall prompts. Front = "derive Y given X," never "what is X?" KaTeX OK for math (renderer supports it). Verify with `npm run build` to catch KaTeX parse errors. |
| `generate-quiz` | "create a quiz for <topic>", "scaffold a quiz yaml" | Creates the YAML file matching the schema parsed by `quiz-content.ts`. **File only** — content authoring is a separate pass. |

### Updating a skill

If you change the contract a skill produces (e.g., add a new required field), update **both** `.claude/skills/<name>/SKILL.md` and `~/.claude/skills/<name>/SKILL.md`. After editing, `cp .claude/skills/<name>/SKILL.md ~/.claude/skills/<name>/SKILL.md` keeps them in lockstep.

### Generating new content end-to-end

1. **Invoke the skill** (e.g., `/generate-coding-challenge`) with topic + brief.
2. **Verify** — for challenges, run `python3 -c` against the solution+tests; for flashcards, `npm run build`; for quizzes, open the topic's `/quizzes/play` page in dev.
3. **Register** if the skill didn't auto-register (it should, but double-check `practice-repository.ts` for challenges and `flashcard-content.ts` for decks).
4. **Visual smoke test** — `npm run dev`, walk through the new surface, make sure it shows up in `/challenges`, the topic's `Practice at a glance` grid, and (for flashcards) the `Review N flashcards →` pill on `/topics`.

## 4. The Pyodide pipeline — the part that breaks subtly

`src/lib/pyodide/pyodide-worker.ts` is the **single source of truth** for in-browser Python. The message protocol:

```
init → init-progress* → ready | init-error
run  → run-result { results, stdout, consoleLines, traceback?, totalMs, plots, animations }
run-test → run-result (single test)
```

### Two Python shims fetched at init from `public/atlas-python/`

- `robotics.py` — math/kinematics helpers (`rot_x/y/z`, `homogeneous`, `skew`, `PID`).
- `robotics_sim.py` — matplotlib animation helpers (`animate_pendulum`, `animate_trajectory_2d`, `animate_arm_2d`, `simulate_cart_pole`).

These live in **two places** — `src/data/python/<name>.py` (canonical) and `public/atlas-python/<name>.py` (served). **You must `cp` between them whenever you change either.** A future improvement is a single source + copy-on-build, but today the project relies on manual sync.

### FuncAnimation tracking — the bug that recurs

The worker monkey-patches `matplotlib.animation.FuncAnimation` per-run to track every animation instance. **If any module does `from matplotlib.animation import FuncAnimation` at import time, that module captures a reference to the original class and bypasses tracking forever.** This happened once already: `robotics_sim.py` imported `FuncAnimation` at module-level, so when user code called `animate_arm_2d(...)` it bypassed the tracker, and the figure was caught only as a static (empty) plot. Fix is in place: use `import matplotlib.animation as _mpl_anim` at module level and call `_mpl_anim.FuncAnimation(...)` at function-call time. **Do not revert this.**

Related fix: every `animate_*` helper calls `update(0)` once before returning the animation, so the figure is non-empty if tracking ever fails again. `collectAnimations()` in the worker closes each animation figure after rendering, so `collectPlots()` won't double-capture it.

### When extending the worker

- New message type? Update both the `RunOutcome` interface AND `use-pyodide-runner.ts`, AND the consumer (`challenge-runner.tsx` or new component).
- New Pyodide package? Add to `DEFAULT_PACKAGES` if it should preload, or to a challenge's `pythonPackages` in `meta.ts` for per-challenge install via micropip.

## 5. Supabase — schema, RLS, migrations

### Tables (in order of introduction)

| Migration | Tables / changes |
|---|---|
| `0001_init.sql` | `topic_progress`, `topic_engagement`, `quiz_attempts`, `question_attempts` |
| `0002_review_automation.sql` | `review_preferences`, `topic_review_state`, `review_prompts` |
| `0003_review_admin_rpc.sql` | RPCs for the review automation cron |
| `0004_challenge_attempts.sql` | `challenge_attempts` |
| `0005_mixed_review.sql` | adds `score_delta` to `quiz_attempts`, `confidence` to `question_attempts` |
| `0006_flashcards.sql` | `flashcard_reviews` |
| `0007_topic_journal.sql` | `topic_journal_entries` (free-recall + reflection) |

### RLS pattern — own-only via Clerk JWT

Every user-scoped table has policies of the shape:
```sql
create policy "x_select_own" on public.x
  for select using (user_id = auth.jwt() ->> 'sub');
```
The Clerk session's `sub` claim is the user id (a text string, **not a UUID**). New tables MUST follow this pattern. New writes MUST set `user_id` to the Clerk sub.

### Migration etiquette

1. Number sequentially: `00NN_<short_snake_case>.sql`. Don't reuse a number.
2. Author the SQL file in `supabase/migrations/`, commit it.
3. Apply via Supabase MCP: `mcp__supabase__apply_migration` with `project_id: "qndrkjcyrolywzrroadb"` and a snake_case `name`.
4. Verify with `mcp__supabase__list_tables` before declaring done.
5. **Never `apply_migration` before the SQL file is committed.** The file is the canonical record; the remote DB is a downstream applier.

### Demo-user pattern

`getCurrentUser()` in `src/lib/auth/current-user.ts` returns `{ id: 'demo-user', ... }` for signed-out users. **Every Supabase write must no-op when `user_id === 'demo-user'`** — RLS will reject the write anyway, but a quiet no-op prevents log spam and broken-looking UI. Pattern:
```ts
if (!userId || userId === 'demo-user') return;
```
See `src/lib/practice/challenge-tracker.ts` for the reference implementation.

## 6. The reflection contract — cross-component completion hook

`src/components/learn/reflection-context.tsx` exposes `useReflection()` returning `{ trigger: (opts) => void }`. Call it on session completion (quiz finished, challenge solved, flashcard set done, mixed-session ended). The hook gracefully no-ops when no provider is mounted — but the provider is mounted at the root layout, so in practice you can call this from any client component.

```ts
import { useReflection } from '@/components/learn/reflection-context';
const { trigger } = useReflection();
trigger({ kind: 'quiz' | 'mixed-session' | 'flashcards' | 'challenge', topicSlug });
```

When you add a new session-style surface, wire it in. Don't duplicate the reflection modal.

## 7. Mastery levels — the derived layer

`src/lib/progress/proficiency-calculator.ts` exports `levelFromScore(score, status) → MasteryLevel` where level ∈ `attempted | familiar | proficient | mastered | locked`. Thresholds are 1+, 30+, 70+, 90+; `locked` always wins.

**Watch-out:** `LearnerTopicStatus` in `src/types/learner.ts` is the canonical status enum (`strong | active | needs_work | decaying | blocked | locked`). Do **not** pass arbitrary strings like `"available"` to `levelFromScore` — TypeScript will catch it but only if you import the type. This regressed once.

## 8. Visual style — Apple aesthetic, strictly

Per the user's design memory (`~/.claude/projects/-Users-Rabees-Development-DesignBuildShip-AtlasLearning/memory/feedback_visual_design.md`):

- **Borderless.** Depth comes from background tone shifts and soft shadows on hover. Never hairlines.
- **Rounded.** 18–24px on cards, pill buttons.
- **Hover.** ~300ms ease, `translateY(-2px)`, subtle shadow grow.
- **Palette.** White canvas, `#F5F5F7` for tiles (`bg-[var(--tile)]`), single accent `#0066CC` (`var(--accent)`).
- **Typography.** Roboto Sans (300–900) + Roboto Mono.
- **Primitives.** Reuse `Card`, `Badge`, `Button`, `SectionHeader`, `ProgressBar`, `Stat` from `src/components/shared/ui.tsx`. **Do not introduce new visual primitives.**

### Button variants — black-bar gotcha

`<Button variant="primary">` is `bg-[var(--ink)]` (near-black). Two stacked primary buttons on a card can read as "two black bars covering the surface" because the dark fill dominates the eye. **For dashboard CTAs on tile backgrounds, prefer `variant="accent"` (Apple link blue) with `className="w-full"`** so they read as inviting pills. Reserve `primary` for one-off page-level submits.

## 9. Routes — current map

```
/                                        landing
/dashboard                               proficiency at a glance, mixed-review + flashcard CTAs
/topics                                  all topics index, with per-topic flashcard pill
/topics/[slug]                           topic overview (4-col Practice at a glance)
/topics/[slug]/learn                     markdown + probes + free-recall prompt
/topics/[slug]/flashcards                topic deck review
/topics/[slug]/quizzes                   topic quizzes index
/topics/[slug]/quizzes/play              QuizPlayer with confidence rating
/topics/[slug]/challenges                topic challenges list
/topics/[slug]/projects                  empty surface (future work)
/challenges                              all challenges index (filters + Solved badges)
/challenges/[slug]                       Pyodide runner: Monaco, tests, hints, console, animations, attempts panel
/review/flashcards?topic=<slug>          global flashcard review (filterable by topic)
/review/mixed?mode=refresh|mixed&n=N     Interleaved practice — Refresh demotes, Mixed doesn't
/settings                                review preferences
/sign-in, /sign-up                       Clerk
```

When adding a new route, check whether its surface needs to appear on the dashboard, the `/topics` index card, the topic overview "Practice at a glance" grid, AND `TopicTabs`. **Forgetting one of those four entry points is the most common shipping bug in this repo.**

## 10. Recurring failure modes — read this twice

These have all happened at least once. Pattern-match before debugging.

1. **"Challenge exists on disk but doesn't show on `/challenges`"** — you forgot to register it in `practice-repository.ts`. The on-disk loader is necessary but not sufficient for the index page.
2. **"Flashcard deck file exists but `listFlashcardsForTopic` returns 0"** — you forgot to import the deck in `flashcard-content.ts`. Same dual-registration trap.
3. **"Animation renders as a blank plot"** — see §4. Almost always module-level `from matplotlib.animation import FuncAnimation`. Use late binding.
4. **"Dashboard pill is black instead of blue"** — Button `variant="primary"` on a dark color variable. Switch to `accent` + `w-full`. See §8.
5. **"Type error: 'available' is not assignable to LearnerTopicStatus"** — you passed a curriculum-side status string into a learner-side function. The enums are distinct. Import the type and use one of the six legal values.
6. **"Migration applied but build still broken"** — type generation. After a schema change, the TS types in `src/types/database.ts` (if maintained) may need regenerating via `mcp__supabase__generate_typescript_types`.
7. **"Demo user is seeing spam errors in console"** — a write path is missing the `if (!userId || userId === 'demo-user') return` guard.
8. **"My new completion screen doesn't show a reflection prompt"** — you didn't call `useReflection().trigger(...)`. See §6.
9. **"The shim works in dev but not after deploy"** — you edited `src/data/python/*.py` but forgot to `cp` to `public/atlas-python/*.py`. They are two copies of the same file.
10. **"`/review/flashcards` returns empty"** — the deck files exist but `listFlashcardTopics()` returns `[]` because the import map in `flashcard-content.ts` wasn't updated. Both topic-scope and global review hit the same loader.

## 11. Where to find prior planning

The current milestone plan lives at `/Users/Rabees/.claude/plans/i-want-to-implment-breezy-petal.md`. The next-deployment roadmap is in `Project_Proposal.md` under "Next Deployment — Retention & Tutoring Milestone." If you're picking up after a context-switch, read both.

## 12. Auth-aware providers — what's mounted where

`src/components/shared/auth-aware-providers.tsx` is mounted at the app root. It wraps the tree in (in order, outer-to-inner):
- Clerk provider
- Supabase client provider
- `ReflectionProvider` (from §6)
- `TutorProvider` (from §14) + a singleton `<TutorCompanion />` at the bottom

Add new client-side context providers here, never deeper, so every client component can consume them.

## 14. The tutor pipeline — Ask Atlas

`Ask Atlas` is a **global**, surface-aware learning companion. One floating pill is rendered everywhere (except `/sign-in`, `/sign-up`); clicking it slides in a right-rail panel. Per-page state is published into `TutorProvider` via `useTutorSurface(...)`.

### Data flow

```
client component                 server route                 LLM
  useTutorSurface(...)              /api/tutor              Groq llama-3.3-70b
        ↓                                ↑                       ↑
  user types message  →  fetch POST  →  context loader  →  buildSystemPrompt
                                       (topic md, code,         (surface overlay
                                        retrieved chunks)        + JSON envelope)
                                            ↓
                                     persist to
                                     tutor_exchanges
                                     (skip demo / signed-out)
```

### Surface contract — `src/lib/tutor/types.ts` + `system-prompt.ts`

Six surfaces, two modes:

| Surface     | Mode                | Output kinds allowed |
|-------------|---------------------|----------------------|
| `learn`     | Explanatory-Socratic| `explain`, `question` |
| `quiz`      | Strict Socratic     | `question` |
| `flashcard` | Strict Socratic     | `question` |
| `challenge` | Code-grounded ladder| `question`, `diff_hint` |
| `review`    | Strict Socratic     | `question` |
| `global`    | Explanatory-Socratic| `explain`, `question` |

`violatesSurfaceContract(surface, kind)` is the server-side enforcer. The route retries once on violation, then surfaces a graceful fallback message.

### Retrieval corpus

`reference_chunks` (pgvector / `voyage-3-lite`, 512-dim) holds:
- The two mature topic notes (`linear-algebra-robotics`, `calculus-robotics`) chunked by H2.
- Every `src/data/references/*.md` chunked the same way.

Build (or rebuild) with:
```
npm run build:tutor-corpus
```

This is required after editing topic notes or reference docs — embeddings are stale otherwise. Env vars: `VOYAGE_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`.

The retrieval implementation in `src/lib/tutor/retrieval.ts` currently does client-side k-NN in JS because the corpus is small (<200 chunks). If the corpus grows past ~1000 chunks, replace with a pgvector RPC.

### Answer-leak guards

Three layers:
1. **Per-surface assembly** in `loadSurfaceBlock` — the route only ever loads what each surface is allowed to see (e.g., quiz answer key is NEVER fetched).
2. **Field stripping** in `sanitizeSurface` — any key in `surface` matching `/answer|solution|correct|cardback/i` is dropped, regardless of what the client smuggled.
3. **System prompt overlay** for `quiz` and `flashcard` surfaces explicitly forbids identifying correct answers.

When adding a new surface, mirror all three layers.

### Demo-user behavior

Demo / signed-out users **can** use the tutor (otherwise the demo loses its headline feature). The route skips the `tutor_exchanges` insert when there is no Clerk user ID. See §5.

### Adding a new surface

1. Add it to the `TutorSurface` union in `src/lib/tutor/types.ts`.
2. Add a system prompt overlay in `src/lib/tutor/system-prompt.ts`.
3. Add a `loadSurfaceBlock` case in `src/app/api/tutor/route.ts`.
4. Add the `useTutorSurface(...)` call from the corresponding client page.
5. If the surface has hidden ground truth (answer keys, solution code), put the leak guard in place at all three layers above.

## 13. When in doubt

- **Don't invent new visual primitives.** Compose existing ones.
- **Don't bypass the dual-registration** for challenges and flashcards.
- **Don't import `FuncAnimation` directly** in any module that ships to the worker.
- **Don't apply migrations before committing the SQL file.**
- **Don't add `Badge`s for cosmetic flair.** The user has explicitly rejected this.
- **Don't add leaderboards, streaks-of-app-opens, or other extrinsic motivators.** Retention is the goal; intrinsic motivation drives it.

When you need to make a tradeoff that touches the above, surface it to the user before doing it. They have strong opinions for evidence-based reasons.
