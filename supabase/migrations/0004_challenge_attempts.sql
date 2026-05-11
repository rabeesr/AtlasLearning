-- AtlasLearning: challenge attempts persistence
-- Mirrors the quiz_attempts pattern: own-only RLS keyed off Clerk's
-- `sub` claim in the Supabase JWT.

create table if not exists public.challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  challenge_slug text not null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  last_results jsonb,
  last_code text,
  revealed_solution boolean not null default false
);

create index if not exists challenge_attempts_user_slug_started_idx
  on public.challenge_attempts (user_id, challenge_slug, started_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.challenge_attempts enable row level security;

drop policy if exists "ca_select_own" on public.challenge_attempts;
drop policy if exists "ca_insert_own" on public.challenge_attempts;
drop policy if exists "ca_update_own" on public.challenge_attempts;
drop policy if exists "ca_delete_own" on public.challenge_attempts;

create policy "ca_select_own" on public.challenge_attempts
  for select using (user_id = auth.jwt() ->> 'sub');
create policy "ca_insert_own" on public.challenge_attempts
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "ca_update_own" on public.challenge_attempts
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "ca_delete_own" on public.challenge_attempts
  for delete using (user_id = auth.jwt() ->> 'sub');
