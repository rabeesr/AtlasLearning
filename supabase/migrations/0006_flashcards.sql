-- 0006_flashcards.sql — Phase 2.1 (BETA)
-- Per-user spaced-repetition state for flashcard reviews.
-- Card content lives in the repo (`src/data/domains/robotics/flashcards/<topic>/cards.ts`);
-- only review history persists here.

create table if not exists public.flashcard_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  card_id text not null,
  reviewed_at timestamptz not null default now(),
  rating text not null check (rating in ('again','hard','good','easy')),
  interval_days integer not null default 1,
  next_due_at timestamptz not null
);
create index if not exists flashcard_reviews_user_due_idx
  on public.flashcard_reviews (user_id, next_due_at);
create index if not exists flashcard_reviews_user_card_idx
  on public.flashcard_reviews (user_id, card_id, reviewed_at desc);

alter table public.flashcard_reviews enable row level security;
drop policy if exists "fr_select_own" on public.flashcard_reviews;
drop policy if exists "fr_insert_own" on public.flashcard_reviews;
drop policy if exists "fr_update_own" on public.flashcard_reviews;
drop policy if exists "fr_delete_own" on public.flashcard_reviews;
create policy "fr_select_own" on public.flashcard_reviews
  for select using (user_id = auth.jwt() ->> 'sub');
create policy "fr_insert_own" on public.flashcard_reviews
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "fr_update_own" on public.flashcard_reviews
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "fr_delete_own" on public.flashcard_reviews
  for delete using (user_id = auth.jwt() ->> 'sub');
