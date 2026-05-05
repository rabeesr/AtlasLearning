-- AtlasLearning: initial schema, RLS, and seed data
-- Run this in the Supabase SQL editor for your project after enabling
-- Clerk as a Third-Party Auth provider in: Authentication → Providers → Third Party.

-- ─────────────────────────────────────────────────────────────────────────────
-- Tables
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Topic-level progress. user_id IS NULL = seed/demo, visible to everyone.
create table if not exists public.topic_progress (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  topic_slug text not null,
  status text not null check (status in ('locked','available','in_progress','completed','decaying')),
  proficiency_score integer not null default 0 check (proficiency_score between 0 and 100),
  updated_at timestamptz not null default now()
);

-- One row per (user, topic). Treats null user_ids as a single key so
-- partial unique index splits seed rows from per-user rows.
create unique index if not exists topic_progress_user_topic_uniq
  on public.topic_progress (coalesce(user_id, ''), topic_slug);
create index if not exists topic_progress_user_idx
  on public.topic_progress (user_id);

-- 2. Per-topic engagement. Always tied to a real user (no demo rows).
create table if not exists public.topic_engagement (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  topic_slug text not null,
  checked_objectives text[] not null default '{}',
  checked_concepts   text[] not null default '{}',
  completed_challenges text[] not null default '{}',
  completed_projects   text[] not null default '{}',
  updated_at timestamptz not null default now(),
  unique (user_id, topic_slug)
);
create index if not exists topic_engagement_user_idx
  on public.topic_engagement (user_id);

-- 3. Quiz attempts (one row per attempt).
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  topic_slug text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists quiz_attempts_user_topic_started_idx
  on public.quiz_attempts (user_id, topic_slug, started_at desc);

-- 4. Question results within a quiz attempt.
create table if not exists public.question_attempts (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts(id) on delete cascade,
  user_id text not null,
  question_id text not null,
  result text not null check (result in ('correct','partial','incorrect','skipped')),
  selected_choice text,
  unique (attempt_id, question_id)
);
create index if not exists question_attempts_attempt_idx
  on public.question_attempts (attempt_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.topic_progress    enable row level security;
alter table public.topic_engagement  enable row level security;
alter table public.quiz_attempts     enable row level security;
alter table public.question_attempts enable row level security;

-- topic_progress: read own + seed; write only own
drop policy if exists "tp_select_own_and_seed"  on public.topic_progress;
drop policy if exists "tp_insert_own"           on public.topic_progress;
drop policy if exists "tp_update_own"           on public.topic_progress;
drop policy if exists "tp_delete_own"           on public.topic_progress;
create policy "tp_select_own_and_seed" on public.topic_progress
  for select using (user_id = auth.jwt() ->> 'sub' or user_id is null);
create policy "tp_insert_own" on public.topic_progress
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "tp_update_own" on public.topic_progress
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "tp_delete_own" on public.topic_progress
  for delete using (user_id = auth.jwt() ->> 'sub');

-- topic_engagement: own-only across the board
drop policy if exists "te_select_own" on public.topic_engagement;
drop policy if exists "te_insert_own" on public.topic_engagement;
drop policy if exists "te_update_own" on public.topic_engagement;
drop policy if exists "te_delete_own" on public.topic_engagement;
create policy "te_select_own" on public.topic_engagement
  for select using (user_id = auth.jwt() ->> 'sub');
create policy "te_insert_own" on public.topic_engagement
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "te_update_own" on public.topic_engagement
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "te_delete_own" on public.topic_engagement
  for delete using (user_id = auth.jwt() ->> 'sub');

-- quiz_attempts: own-only
drop policy if exists "qa_select_own" on public.quiz_attempts;
drop policy if exists "qa_insert_own" on public.quiz_attempts;
drop policy if exists "qa_update_own" on public.quiz_attempts;
drop policy if exists "qa_delete_own" on public.quiz_attempts;
create policy "qa_select_own" on public.quiz_attempts
  for select using (user_id = auth.jwt() ->> 'sub');
create policy "qa_insert_own" on public.quiz_attempts
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "qa_update_own" on public.quiz_attempts
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "qa_delete_own" on public.quiz_attempts
  for delete using (user_id = auth.jwt() ->> 'sub');

-- question_attempts: own-only (user_id is denormalized here for direct RLS)
drop policy if exists "qra_select_own" on public.question_attempts;
drop policy if exists "qra_insert_own" on public.question_attempts;
drop policy if exists "qra_update_own" on public.question_attempts;
drop policy if exists "qra_delete_own" on public.question_attempts;
create policy "qra_select_own" on public.question_attempts
  for select using (user_id = auth.jwt() ->> 'sub');
create policy "qra_insert_own" on public.question_attempts
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "qra_update_own" on public.question_attempts
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "qra_delete_own" on public.question_attempts
  for delete using (user_id = auth.jwt() ->> 'sub');

-- ─────────────────────────────────────────────────────────────────────────────
-- Seed data — visible to everyone (anon + authenticated). user_id = NULL.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.topic_progress (user_id, topic_slug, status, proficiency_score) values
  -- Phase 1 — Foundations
  (null, 'linear-algebra-robotics',          'completed',   88),
  (null, 'matrix-vector-operations',         'completed',   92),
  (null, 'linear-systems',                   'completed',   86),
  (null, 'eigenvalues-eigenvectors',         'in_progress', 64),
  (null, 'least-squares',                    'in_progress', 71),
  (null, 'calculus-robotics',                'in_progress', 58),
  (null, 'limits-integration',               'completed',   81),
  (null, 'continuous-optimization',          'in_progress', 52),
  (null, 'ordinary-differential-equations',  'in_progress', 41),
  (null, 'laplace-lagrangian',               'available',    0),
  (null, 'intro-ai-programming',             'in_progress', 67),
  (null, 'cpp-fundamentals',                 'in_progress', 73),
  (null, 'discrete-graph-math',              'completed',   84),
  (null, 'search-algorithms',                'in_progress', 55),
  (null, 'systems-programming-robotics',     'in_progress', 49),
  (null, 'linux-bash-git',                   'completed',   90),
  (null, 'c-pointers-memory',                'in_progress', 44),
  (null, 'multithreading-concurrency',       'available',    0),
  (null, 'debugging-tools',                  'in_progress', 35),
  -- Phase 2 — Hardware & Motion
  (null, 'building-moving-robots',           'decaying',    62),
  (null, 'pid-controllers',                  'decaying',    58),
  (null, 'rigid-body-kinematics',            'available',    0),
  (null, 'ros2',                             'available',    0),
  -- Phase 3 — Autonomy
  (null, 'advanced-math-robotics',           'locked',       0),
  (null, 'mobile-robotics-slam',             'locked',       0),
  (null, 'perception-computer-vision',       'available',    0)
on conflict do nothing;
