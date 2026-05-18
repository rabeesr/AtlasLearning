-- 0008_tutor.sql
-- Two tables to support the Ask Atlas learning companion:
--   1. reference_chunks  — embedded corpus of topic notes + curated refs.
--                          Public-readable; written only by the build script
--                          via the service role (no insert/update RLS policy).
--   2. tutor_exchanges   — per-user conversation log spanning every learning
--                          surface (learn, quiz, flashcard, challenge, review,
--                          global). Owned-row RLS, Clerk sub as user_id.

create extension if not exists vector;

-- ---------------------------------------------------------------------------
-- reference_chunks: pgvector index over the tutor's retrieval corpus.
-- ---------------------------------------------------------------------------
create table if not exists public.reference_chunks (
  id           bigserial primary key,
  source_kind  text not null check (source_kind in ('topic', 'reference')),
  source_id    text not null,              -- topic slug or reference filename
  section      text,                       -- H2 heading or null
  content      text not null,
  embedding    vector(512) not null,       -- voyage-3-lite dim
  created_at   timestamptz not null default now()
);

-- Note: no unique index on (source_kind, source_id, section). The build
-- script's size-fallback can produce multiple chunks per H2 section, so
-- (source_kind, source_id, section) is not unique. The build script DELETEs
-- by (source_kind, source_id) before re-inserting, which makes the corpus
-- idempotent without needing a unique constraint.

create index if not exists reference_chunks_embedding_idx
  on public.reference_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 50);

alter table public.reference_chunks enable row level security;

create policy "reference_chunks_select_all"
  on public.reference_chunks
  for select
  using (true);

-- No insert/update/delete policies: writes happen via the service role
-- in scripts/build-tutor-corpus.ts and are not user-facing.

-- ---------------------------------------------------------------------------
-- tutor_exchanges: per-user conversation log.
-- ---------------------------------------------------------------------------
create table if not exists public.tutor_exchanges (
  id           bigserial primary key,
  user_id      text not null,
  session_id   uuid not null,
  surface      text not null check (
    surface in ('learn','quiz','flashcard','challenge','review','global')
  ),
  surface_ref  jsonb not null,
  role         text not null check (role in ('user', 'assistant')),
  kind         text not null check (kind in ('question', 'explain', 'diff_hint')),
  content      text not null,
  created_at   timestamptz not null default now()
);

create index if not exists tutor_exchanges_user_created_idx
  on public.tutor_exchanges (user_id, created_at desc);

create index if not exists tutor_exchanges_session_idx
  on public.tutor_exchanges (session_id, created_at);

alter table public.tutor_exchanges enable row level security;

create policy "tutor_exchanges_select_own"
  on public.tutor_exchanges
  for select
  using (user_id = auth.jwt() ->> 'sub');

create policy "tutor_exchanges_insert_own"
  on public.tutor_exchanges
  for insert
  with check (user_id = auth.jwt() ->> 'sub');
