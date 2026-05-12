-- AtlasLearning: topic journal entries
-- Stores both free-recall responses (end-of-topic) and post-session
-- reflections. Both keyed by Clerk user id; own-only RLS via JWT `sub`.

create table if not exists public.topic_journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  topic_slug text,
  kind text not null check (kind in ('free_recall','reflection')),
  entry_text text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index if not exists topic_journal_user_topic_created_idx
  on public.topic_journal_entries (user_id, topic_slug, created_at desc);
create index if not exists topic_journal_user_kind_created_idx
  on public.topic_journal_entries (user_id, kind, created_at desc);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row-Level Security
-- ─────────────────────────────────────────────────────────────────────────────

alter table public.topic_journal_entries enable row level security;

drop policy if exists "tj_select_own" on public.topic_journal_entries;
drop policy if exists "tj_insert_own" on public.topic_journal_entries;
drop policy if exists "tj_update_own" on public.topic_journal_entries;
drop policy if exists "tj_delete_own" on public.topic_journal_entries;

create policy "tj_select_own" on public.topic_journal_entries
  for select using (user_id = auth.jwt() ->> 'sub');
create policy "tj_insert_own" on public.topic_journal_entries
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "tj_update_own" on public.topic_journal_entries
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "tj_delete_own" on public.topic_journal_entries
  for delete using (user_id = auth.jwt() ->> 'sub');
