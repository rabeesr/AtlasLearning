-- Review automation: per-user preferences, review state, and prompt audit log.

create table if not exists public.review_preferences (
  user_id text primary key,
  reviews_enabled boolean not null default false,
  email_address text not null default '',
  timezone text not null default 'America/Chicago',
  preferred_send_time time not null default '09:00',
  quiet_hours_start time not null default '22:00',
  quiet_hours_end time not null default '08:00',
  spaced_repetition_enabled boolean not null default false,
  daily_target_minutes integer not null default 15 check (daily_target_minutes between 5 and 240),
  cadence text not null default 'daily' check (cadence in ('daily', 'every-other-day', 'weekly')),
  opt_in_topics text[],
  alerts_decay boolean not null default true,
  alerts_streak boolean not null default false,
  alerts_digest boolean not null default true,
  last_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.topic_review_state (
  user_id text not null,
  topic_slug text not null,
  last_reviewed_at timestamptz,
  last_result text check (last_result in ('correct','partial','incorrect')),
  interval_days integer not null default 1 check (interval_days between 1 and 30),
  next_review_at timestamptz,
  last_prompted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_slug)
);

create table if not exists public.review_prompts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  topic_slug text not null,
  question_id text not null,
  question_type text not null check (question_type in ('multiple_choice','short_answer','code')),
  delivery_channel text not null default 'email' check (delivery_channel in ('email')),
  provider_message_id text,
  reply_address text not null,
  prompt_status text not null default 'sent' check (prompt_status in ('sent','answered')),
  sent_at timestamptz not null default now(),
  reply_received_at timestamptz,
  reply_body text,
  reply_result text check (reply_result in ('correct','partial','incorrect')),
  graded_at timestamptz
);

create index if not exists review_prompts_user_sent_idx
  on public.review_prompts (user_id, sent_at desc);
create index if not exists review_prompts_user_topic_idx
  on public.review_prompts (user_id, topic_slug, sent_at desc);
create index if not exists review_prompts_reply_address_idx
  on public.review_prompts (reply_address);

alter table public.review_preferences enable row level security;
alter table public.topic_review_state enable row level security;
alter table public.review_prompts enable row level security;

drop policy if exists "rp_select_own" on public.review_preferences;
drop policy if exists "rp_insert_own" on public.review_preferences;
drop policy if exists "rp_update_own" on public.review_preferences;
drop policy if exists "rp_delete_own" on public.review_preferences;
create policy "rp_select_own" on public.review_preferences
  for select using (user_id = auth.jwt() ->> 'sub');
create policy "rp_insert_own" on public.review_preferences
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "rp_update_own" on public.review_preferences
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "rp_delete_own" on public.review_preferences
  for delete using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "trs_select_own" on public.topic_review_state;
drop policy if exists "trs_insert_own" on public.topic_review_state;
drop policy if exists "trs_update_own" on public.topic_review_state;
drop policy if exists "trs_delete_own" on public.topic_review_state;
create policy "trs_select_own" on public.topic_review_state
  for select using (user_id = auth.jwt() ->> 'sub');
create policy "trs_insert_own" on public.topic_review_state
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "trs_update_own" on public.topic_review_state
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "trs_delete_own" on public.topic_review_state
  for delete using (user_id = auth.jwt() ->> 'sub');

drop policy if exists "rpr_select_own" on public.review_prompts;
drop policy if exists "rpr_insert_own" on public.review_prompts;
drop policy if exists "rpr_update_own" on public.review_prompts;
drop policy if exists "rpr_delete_own" on public.review_prompts;
create policy "rpr_select_own" on public.review_prompts
  for select using (user_id = auth.jwt() ->> 'sub');
create policy "rpr_insert_own" on public.review_prompts
  for insert with check (user_id = auth.jwt() ->> 'sub');
create policy "rpr_update_own" on public.review_prompts
  for update using (user_id = auth.jwt() ->> 'sub')
              with check (user_id = auth.jwt() ->> 'sub');
create policy "rpr_delete_own" on public.review_prompts
  for delete using (user_id = auth.jwt() ->> 'sub');
