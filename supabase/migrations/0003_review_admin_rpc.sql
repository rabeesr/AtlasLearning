-- Replace broad service-role usage in review automation with narrowly scoped
-- security-definer RPCs authenticated by a dedicated shared secret.

create extension if not exists pgcrypto;

create schema if not exists private;

create table if not exists private.review_admin_secrets (
  secret_name text primary key,
  secret_hash text not null,
  created_at timestamptz not null default now()
);

insert into private.review_admin_secrets (secret_name, secret_hash)
values ('reviews_rpc', '9d96e296a3c5d95b42e22df4743dfc95bb42da1d857287b116e8f320e10efc35')
on conflict (secret_name) do update
set secret_hash = excluded.secret_hash;

revoke all on schema private from public;
revoke all on all tables in schema private from public;

create or replace function private.assert_reviews_rpc_secret(p_secret text)
returns void
language plpgsql
security definer
set search_path = private, public
as $$
declare
  expected_hash text;
  provided_hash text;
begin
  select secret_hash
    into expected_hash
  from private.review_admin_secrets
  where secret_name = 'reviews_rpc';

  if expected_hash is null then
    raise exception 'reviews rpc secret is not configured';
  end if;

  provided_hash := encode(digest(coalesce(p_secret, ''), 'sha256'), 'hex');
  if provided_hash <> expected_hash then
    raise exception 'invalid reviews rpc secret';
  end if;
end;
$$;

create or replace function public.list_enabled_review_preferences(p_secret text)
returns setof public.review_preferences
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);
  return query
  select *
  from public.review_preferences
  where reviews_enabled = true
    and spaced_repetition_enabled = true;
end;
$$;

create or replace function public.get_user_review_state(p_secret text, p_user_id text)
returns setof public.topic_review_state
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);
  return query
  select *
  from public.topic_review_state
  where user_id = p_user_id;
end;
$$;

create or replace function public.get_user_review_prompts(
  p_secret text,
  p_user_id text,
  p_topic_slug text
)
returns setof public.review_prompts
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);
  return query
  select *
  from public.review_prompts
  where user_id = p_user_id
    and topic_slug = p_topic_slug;
end;
$$;

create or replace function public.get_user_review_progress(
  p_secret text,
  p_user_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);
  return jsonb_build_object(
    'engagement',
    coalesce(
      (
        select jsonb_agg(to_jsonb(te) order by te.updated_at desc)
        from public.topic_engagement te
        where te.user_id = p_user_id
      ),
      '[]'::jsonb
    ),
    'attempts',
    coalesce(
      (
        select jsonb_agg(to_jsonb(qa) order by qa.started_at desc)
        from public.quiz_attempts qa
        where qa.user_id = p_user_id
      ),
      '[]'::jsonb
    ),
    'questions',
    coalesce(
      (
        select jsonb_agg(to_jsonb(qra))
        from public.question_attempts qra
        where qra.user_id = p_user_id
      ),
      '[]'::jsonb
    )
  );
end;
$$;

create or replace function public.insert_review_prompt(
  p_secret text,
  p_id uuid,
  p_user_id text,
  p_topic_slug text,
  p_question_id text,
  p_question_type text,
  p_reply_address text,
  p_provider_message_id text,
  p_sent_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);

  insert into public.review_prompts (
    id,
    user_id,
    topic_slug,
    question_id,
    question_type,
    delivery_channel,
    provider_message_id,
    reply_address,
    sent_at
  )
  values (
    p_id,
    p_user_id,
    p_topic_slug,
    p_question_id,
    p_question_type,
    'email',
    p_provider_message_id,
    p_reply_address,
    p_sent_at
  );
end;
$$;

create or replace function public.mark_review_prompted(
  p_secret text,
  p_user_id text,
  p_topic_slug text,
  p_sent_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);

  insert into public.topic_review_state (
    user_id,
    topic_slug,
    last_prompted_at,
    updated_at
  )
  values (
    p_user_id,
    p_topic_slug,
    p_sent_at,
    p_sent_at
  )
  on conflict (user_id, topic_slug) do update
  set last_prompted_at = excluded.last_prompted_at,
      updated_at = excluded.updated_at;
end;
$$;

create or replace function public.update_review_last_sent_at(
  p_secret text,
  p_user_id text,
  p_sent_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);

  update public.review_preferences
  set last_sent_at = p_sent_at,
      updated_at = p_sent_at
  where user_id = p_user_id;
end;
$$;

create or replace function public.get_review_prompt(
  p_secret text,
  p_id uuid
)
returns setof public.review_prompts
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);
  return query
  select *
  from public.review_prompts
  where id = p_id
  limit 1;
end;
$$;

create or replace function public.mark_review_prompt_answered(
  p_secret text,
  p_id uuid,
  p_reply_body text,
  p_reply_result text,
  p_graded_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);

  update public.review_prompts
  set prompt_status = 'answered',
      reply_received_at = p_graded_at,
      reply_body = p_reply_body,
      reply_result = p_reply_result,
      graded_at = p_graded_at
  where id = p_id;
end;
$$;

create or replace function public.upsert_review_state(
  p_secret text,
  p_user_id text,
  p_topic_slug text,
  p_last_reviewed_at timestamptz,
  p_last_result text,
  p_interval_days integer,
  p_next_review_at timestamptz,
  p_last_prompted_at timestamptz,
  p_updated_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public, private
as $$
begin
  perform private.assert_reviews_rpc_secret(p_secret);

  insert into public.topic_review_state (
    user_id,
    topic_slug,
    last_reviewed_at,
    last_result,
    interval_days,
    next_review_at,
    last_prompted_at,
    updated_at
  )
  values (
    p_user_id,
    p_topic_slug,
    p_last_reviewed_at,
    p_last_result,
    p_interval_days,
    p_next_review_at,
    p_last_prompted_at,
    p_updated_at
  )
  on conflict (user_id, topic_slug) do update
  set last_reviewed_at = excluded.last_reviewed_at,
      last_result = excluded.last_result,
      interval_days = excluded.interval_days,
      next_review_at = excluded.next_review_at,
      last_prompted_at = excluded.last_prompted_at,
      updated_at = excluded.updated_at;
end;
$$;

create or replace function public.insert_review_quiz_result(
  p_secret text,
  p_user_id text,
  p_topic_slug text,
  p_question_id text,
  p_result text,
  p_selected_choice text,
  p_completed_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_attempt_id uuid := gen_random_uuid();
begin
  perform private.assert_reviews_rpc_secret(p_secret);

  insert into public.quiz_attempts (
    id,
    user_id,
    topic_slug,
    started_at,
    completed_at
  )
  values (
    v_attempt_id,
    p_user_id,
    p_topic_slug,
    p_completed_at,
    p_completed_at
  );

  insert into public.question_attempts (
    attempt_id,
    user_id,
    question_id,
    result,
    selected_choice
  )
  values (
    v_attempt_id,
    p_user_id,
    p_question_id,
    p_result,
    p_selected_choice
  );

  return v_attempt_id;
end;
$$;

create or replace function public.get_review_email_address(
  p_secret text,
  p_user_id text
)
returns text
language plpgsql
security definer
set search_path = public, private
as $$
declare
  v_email text;
begin
  perform private.assert_reviews_rpc_secret(p_secret);

  select email_address
    into v_email
  from public.review_preferences
  where user_id = p_user_id;

  return v_email;
end;
$$;

revoke all on function private.assert_reviews_rpc_secret(text) from public;

grant usage on schema public to anon, authenticated;
grant execute on function public.list_enabled_review_preferences(text) to anon, authenticated;
grant execute on function public.get_user_review_state(text, text) to anon, authenticated;
grant execute on function public.get_user_review_prompts(text, text, text) to anon, authenticated;
grant execute on function public.get_user_review_progress(text, text) to anon, authenticated;
grant execute on function public.insert_review_prompt(text, uuid, text, text, text, text, text, text, timestamptz) to anon, authenticated;
grant execute on function public.mark_review_prompted(text, text, text, timestamptz) to anon, authenticated;
grant execute on function public.update_review_last_sent_at(text, text, timestamptz) to anon, authenticated;
grant execute on function public.get_review_prompt(text, uuid) to anon, authenticated;
grant execute on function public.mark_review_prompt_answered(text, uuid, text, text, timestamptz) to anon, authenticated;
grant execute on function public.upsert_review_state(text, text, text, timestamptz, text, integer, timestamptz, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.insert_review_quiz_result(text, text, text, text, text, text, timestamptz) to anon, authenticated;
grant execute on function public.get_review_email_address(text, text) to anon, authenticated;
