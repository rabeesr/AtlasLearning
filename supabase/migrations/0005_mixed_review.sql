-- AtlasLearning: Phase 1 — mixed review + confidence rating
-- Adds per-attempt score delta auditing on quiz_attempts and a confidence
-- field on question_attempts (one of: 'low' | 'medium' | 'high'). No new
-- tables. Existing RLS policies cover both columns.

alter table public.quiz_attempts
  add column if not exists score_delta integer default 0;

alter table public.question_attempts
  add column if not exists confidence text;

alter table public.question_attempts
  drop constraint if exists question_attempts_confidence_check;

alter table public.question_attempts
  add constraint question_attempts_confidence_check
  check (confidence is null or confidence in ('low','medium','high'));
