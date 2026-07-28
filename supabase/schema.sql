-- Banda 5 - banco, seguranca e armazenamento
-- Execute este arquivo no SQL Editor de um projeto Supabase novo.

create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.question_banks (
  id smallint primary key default 1 check (id = 1),
  data jsonb not null default '[]'::jsonb,
  revision uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.question_banks add column if not exists revision uuid not null default gen_random_uuid();

create table if not exists private.question_banks (
  id smallint primary key check (id = 1),
  data jsonb not null default '[]'::jsonb,
  revision uuid not null default gen_random_uuid(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists private.question_bank_versions (
  revision uuid primary key,
  data jsonb not null,
  published_at timestamptz not null default now(),
  published_by uuid references auth.users(id)
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  client_submission_id uuid not null unique,
  created_at timestamptz not null default now(),
  participant_name text not null,
  participant_email text,
  instrument text,
  assessment_version text,
  question_bank_revision uuid,
  answers jsonb not null,
  answer_snapshot jsonb not null default '[]'::jsonb,
  scores jsonb not null,
  review_items jsonb not null default '[]'::jsonb,
  plan jsonb not null default '{}'::jsonb,
  status text not null default 'new' check (status in ('new', 'reviewed', 'archived'))
);

alter table public.submissions add column if not exists assessment_version text;
alter table public.submissions add column if not exists question_bank_revision uuid;
alter table public.submissions add column if not exists answer_snapshot jsonb not null default '[]'::jsonb;
alter table public.submissions add column if not exists review_items jsonb not null default '[]'::jsonb;

create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_email_idx on public.submissions (participant_email);

alter table public.admins enable row level security;
alter table public.question_banks enable row level security;
alter table public.submissions enable row level security;

revoke all on table public.admins from anon, authenticated;
revoke all on table public.question_banks from anon, authenticated;
revoke all on table public.submissions from anon, authenticated;
grant select on table public.admins to authenticated;
grant select on table public.question_banks to anon, authenticated;
grant select, update, delete on table public.submissions to authenticated;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

create or replace function private.sanitize_question_bank(p_data jsonb)
returns jsonb
language plpgsql
immutable
set search_path = ''
as $$
declare
  v_result jsonb := '[]'::jsonb;
  v_section jsonb;
  v_questions jsonb;
  v_sanitized_questions jsonb;
  v_instruments jsonb;
  v_instrument record;
begin
  if p_data is null or jsonb_typeof(p_data) <> 'array' then return '[]'::jsonb; end if;
  for v_section in select value from jsonb_array_elements(p_data)
  loop
    if coalesce((v_section->>'dynamicInstrument')::boolean, false) then
      v_instruments := '{}'::jsonb;
      for v_instrument in select key, value from jsonb_each(coalesce(v_section->'questionsByInstrument', '{}'::jsonb))
      loop
        select coalesce(jsonb_agg(question.value - 'correct' - 'explanation'), '[]'::jsonb)
        into v_sanitized_questions
        from jsonb_array_elements(coalesce(v_instrument.value, '[]'::jsonb)) as question(value);
        v_instruments := v_instruments || jsonb_build_object(v_instrument.key, v_sanitized_questions);
      end loop;
      v_section := jsonb_set(v_section, '{questionsByInstrument}', v_instruments);
    else
      v_questions := coalesce(v_section->'questions', '[]'::jsonb);
      select coalesce(jsonb_agg(question.value - 'correct' - 'explanation'), '[]'::jsonb)
      into v_sanitized_questions
      from jsonb_array_elements(v_questions) as question(value);
      v_section := jsonb_set(v_section, '{questions}', v_sanitized_questions);
    end if;
    v_result := v_result || jsonb_build_array(v_section);
  end loop;
  return v_result;
end;
$$;

revoke all on function private.sanitize_question_bank(jsonb) from public, anon, authenticated;

create or replace function public.get_admin_question_bank()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_data jsonb;
  v_revision uuid;
  v_updated_at timestamptz;
begin
  if not public.is_admin() then raise exception 'Acesso administrativo necessário.'; end if;
  select data, revision, updated_at into v_data, v_revision, v_updated_at from private.question_banks where id = 1;
  return jsonb_build_object('data', coalesce(v_data, '[]'::jsonb), 'revision', v_revision, 'updated_at', v_updated_at);
end;
$$;

revoke all on function public.get_admin_question_bank() from public, anon, authenticated;
grant execute on function public.get_admin_question_bank() to authenticated;

create or replace function public.publish_question_bank(p_data jsonb, p_expected_revision uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_current_revision uuid;
  v_new_revision uuid := gen_random_uuid();
  v_updated_at timestamptz := now();
  v_public_data jsonb;
  v_name_field jsonb;
  v_email_field jsonb;
  v_instrument_field jsonb;
begin
  if not public.is_admin() then raise exception 'Acesso administrativo necessário.'; end if;
  if p_data is null or jsonb_typeof(p_data) <> 'array' or jsonb_array_length(p_data) = 0 then raise exception 'Banco de perguntas inválido.'; end if;
  if octet_length(p_data::text) > 750000 then raise exception 'Banco de perguntas acima do limite permitido.'; end if;
  select question.value into v_name_field
  from jsonb_array_elements(p_data) as section(value)
  cross join lateral jsonb_array_elements(case when jsonb_typeof(section.value->'questions') = 'array' then section.value->'questions' else '[]'::jsonb end) as question(value)
  where question.value->>'id' = 'nome' limit 1;
  select question.value into v_email_field
  from jsonb_array_elements(p_data) as section(value)
  cross join lateral jsonb_array_elements(case when jsonb_typeof(section.value->'questions') = 'array' then section.value->'questions' else '[]'::jsonb end) as question(value)
  where question.value->>'id' = 'email' limit 1;
  select question.value into v_instrument_field
  from jsonb_array_elements(p_data) as section(value)
  cross join lateral jsonb_array_elements(case when jsonb_typeof(section.value->'questions') = 'array' then section.value->'questions' else '[]'::jsonb end) as question(value)
  where question.value->>'id' = 'instrumento' limit 1;
  if v_name_field is null or v_name_field->>'type' is distinct from 'text' or not coalesce((v_name_field->>'required')::boolean, true) then raise exception 'Campo obrigatório nome inválido.'; end if;
  if v_email_field is null or v_email_field->>'type' is distinct from 'email' or not coalesce((v_email_field->>'required')::boolean, true) then raise exception 'Campo obrigatório email inválido.'; end if;
  if v_instrument_field is null or v_instrument_field->>'type' is distinct from 'single' or not coalesce((v_instrument_field->>'required')::boolean, true) or case when jsonb_typeof(v_instrument_field->'options') = 'array' then jsonb_array_length(v_instrument_field->'options') <> 6 or not coalesce(v_instrument_field->'options' @> '["Bateria","Baixo","Violão","Guitarra","Teclado","Vocal"]'::jsonb, false) else true end then raise exception 'Campo obrigatório instrumento inválido.'; end if;
  select revision into v_current_revision from private.question_banks where id = 1 for update;
  if v_current_revision is not null and p_expected_revision is distinct from v_current_revision then raise exception 'CONFLITO_DE_VERSAO'; end if;
  v_public_data := private.sanitize_question_bank(p_data);
  insert into private.question_bank_versions (revision, data, published_at, published_by)
  values (v_new_revision, p_data, v_updated_at, v_user);
  insert into private.question_banks (id, data, revision, updated_at, updated_by)
  values (1, p_data, v_new_revision, v_updated_at, v_user)
  on conflict (id) do update set data = excluded.data, revision = excluded.revision, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  insert into public.question_banks (id, data, revision, updated_at, updated_by)
  values (1, v_public_data, v_new_revision, v_updated_at, v_user)
  on conflict (id) do update set data = excluded.data, revision = excluded.revision, updated_at = excluded.updated_at, updated_by = excluded.updated_by;
  return jsonb_build_object('revision', v_new_revision, 'updated_at', v_updated_at);
end;
$$;

revoke all on function public.publish_question_bank(jsonb, uuid) from public, anon, authenticated;
grant execute on function public.publish_question_bank(jsonb, uuid) to authenticated;

drop policy if exists "Admins view own membership" on public.admins;
create policy "Admins view own membership" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Published questions are public" on public.question_banks;
create policy "Published questions are public" on public.question_banks
  for select to anon, authenticated using (true);

drop policy if exists "Admins insert question bank" on public.question_banks;
drop policy if exists "Admins update question bank" on public.question_banks;

drop policy if exists "Anyone submits once" on public.submissions;

drop policy if exists "Admins read submissions" on public.submissions;
create policy "Admins read submissions" on public.submissions
  for select to authenticated using ((select public.is_admin()));

drop policy if exists "Admins update submissions" on public.submissions;
create policy "Admins update submissions" on public.submissions
  for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

drop policy if exists "Admins delete submissions" on public.submissions;
create policy "Admins delete submissions" on public.submissions
  for delete to authenticated using ((select public.is_admin()));

drop function if exists public.submit_diagnosis(uuid, jsonb, jsonb, jsonb, text);

create or replace function public.submit_diagnosis(
  p_client_submission_id uuid,
  p_question_bank_revision uuid,
  p_participant jsonb,
  p_answers jsonb,
  p_plan jsonb,
  p_assessment_version text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_bank jsonb;
  v_section jsonb;
  v_questions jsonb;
  v_question jsonb;
  v_id text;
  v_type text;
  v_category text;
  v_required boolean;
  v_instrument text := trim(coalesce(p_participant->>'funcao', p_answers->>'instrumento', ''));
  v_name text := trim(coalesce(p_participant->>'nome', ''));
  v_email text := lower(trim(coalesce(p_participant->>'email', '')));
  v_raw_answer text;
  v_display_answer text;
  v_selected_index integer;
  v_correct_index integer;
  v_score numeric;
  v_objective_total integer := 0;
  v_objective_sum numeric := 0;
  v_self_total integer := 0;
  v_self_sum numeric := 0;
  v_category_sums jsonb := '{"teoria":0,"harmonia":0,"ritmo":0,"percepcao":0,"conjunto":0,"preparo":0,"tecnica_especifica":0}'::jsonb;
  v_category_counts jsonb := '{"teoria":0,"harmonia":0,"ritmo":0,"percepcao":0,"conjunto":0,"preparo":0,"tecnica_especifica":0}'::jsonb;
  v_categories text[] := array['teoria','harmonia','ritmo','percepcao','conjunto','preparo','tecnica_especifica'];
  v_reviews jsonb := '[]'::jsonb;
  v_snapshot jsonb := '[]'::jsonb;
  v_scores jsonb := '{}'::jsonb;
  v_demonstrated integer;
  v_self_assessment integer;
  v_general integer;
  v_existing_id uuid;
  v_existing_scores jsonb;
  v_existing_reviews jsonb;
  v_answer_count integer;
begin
  if p_client_submission_id is null then raise exception 'Protocolo inválido.'; end if;
  if p_question_bank_revision is null then raise exception 'Versão da avaliação inválida.'; end if;
  if p_participant is null or jsonb_typeof(p_participant) <> 'object' then raise exception 'Participante inválido.'; end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then raise exception 'Respostas inválidas.'; end if;
  if p_plan is null or jsonb_typeof(p_plan) <> 'object' then raise exception 'Plano inválido.'; end if;
  if char_length(v_name) not between 1 and 160 then raise exception 'Nome inválido.'; end if;
  if char_length(v_email) not between 3 and 254 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' then raise exception 'E-mail inválido.'; end if;
  if v_instrument not in ('Bateria','Baixo','Violão','Guitarra','Teclado','Vocal') then raise exception 'Função musical inválida.'; end if;
  if trim(coalesce(p_answers->>'nome', '')) <> v_name or lower(trim(coalesce(p_answers->>'email', ''))) <> v_email or trim(coalesce(p_answers->>'instrumento', '')) <> v_instrument then raise exception 'Identificação inconsistente.'; end if;
  if octet_length(p_answers::text) > 120000 or octet_length(p_plan::text) > 30000 then raise exception 'Conteúdo acima do limite permitido.'; end if;
  select count(*) into v_answer_count from jsonb_object_keys(p_answers);
  if v_answer_count > 250 then raise exception 'Quantidade de respostas acima do limite.'; end if;

  select id, scores, review_items into v_existing_id, v_existing_scores, v_existing_reviews
  from public.submissions where client_submission_id = p_client_submission_id;
  if found then
    return jsonb_build_object('id', p_client_submission_id::text, 'scores', v_existing_scores, 'review_items', v_existing_reviews, 'duplicate', true);
  end if;

  select data into v_bank from private.question_bank_versions where revision = p_question_bank_revision;
  if v_bank is null then raise exception 'AVALIACAO_ATUALIZADA'; end if;
  if jsonb_typeof(v_bank) <> 'array' or jsonb_array_length(v_bank) = 0 then raise exception 'Avaliação ainda não foi publicada.'; end if;

  for v_section in select value from jsonb_array_elements(v_bank)
  loop
    if coalesce((v_section->>'dynamicInstrument')::boolean, false) then
      v_questions := coalesce((v_section->'questionsByInstrument')->v_instrument, '[]'::jsonb);
    else
      v_questions := coalesce(v_section->'questions', '[]'::jsonb);
    end if;
    if jsonb_typeof(v_questions) <> 'array' then continue; end if;

    for v_question in select value from jsonb_array_elements(v_questions)
    loop
      v_id := v_question->>'id';
      if v_id is null then raise exception 'Pergunta sem identificação no banco.'; end if;
      v_required := coalesce((v_question->>'required')::boolean, true);
      if not (p_answers ? v_id) then
        if v_required then raise exception 'Resposta obrigatória ausente: %', v_id; end if;
        continue;
      end if;
      v_type := v_question->>'type';
      v_category := v_question->>'category';
      v_raw_answer := p_answers->>v_id;
      if v_required and (v_raw_answer is null or btrim(v_raw_answer) = '') then raise exception 'Resposta obrigatória vazia: %', v_id; end if;
      if char_length(coalesce(v_raw_answer, '')) > 5000 then raise exception 'Resposta acima do limite: %', v_id; end if;
      v_display_answer := v_raw_answer;
      v_score := null;

      if v_type in ('quiz','audioQuiz') then
        if not coalesce(v_raw_answer ~ '^[0-9]+$', false) or not coalesce((v_question->>'correct') ~ '^[0-9]+$', false) then raise exception 'Alternativa inválida: %', v_id; end if;
        v_selected_index := v_raw_answer::integer;
        v_correct_index := (v_question->>'correct')::integer;
        if jsonb_typeof(v_question->'options') <> 'array' or v_selected_index < 0 or v_selected_index >= jsonb_array_length(v_question->'options') or v_correct_index < 0 or v_correct_index >= jsonb_array_length(v_question->'options') then raise exception 'Índice de alternativa inválido: %', v_id; end if;
        v_display_answer := coalesce(v_question->'options'->>v_selected_index, v_raw_answer);
        v_score := case when v_selected_index = v_correct_index then 100 else 0 end;
        v_objective_total := v_objective_total + 1;
        v_objective_sum := v_objective_sum + v_score;
        if v_selected_index <> v_correct_index then
          v_reviews := v_reviews || jsonb_build_array(jsonb_build_object(
              'id', v_id,
              'question', coalesce(v_question->>'text', v_id),
              'category', v_category,
              'area', case v_category when 'teoria' then 'Teoria' when 'harmonia' then 'Harmonia' when 'ritmo' then 'Ritmo' when 'percepcao' then 'Percepção' when 'conjunto' then 'Tocar em conjunto' when 'preparo' then 'Preparo' when 'tecnica_especifica' then 'Técnica da função' else coalesce(v_category, 'Conteúdo') end,
              'selected', v_display_answer,
              'correct', coalesce(v_question->'options'->>v_correct_index, '—'),
              'audio', v_type = 'audioQuiz',
              'guidance', case v_category when 'teoria' then 'Revisar notas, intervalos, escalas e acidentes com exercícios curtos de identificação.' when 'harmonia' then 'Praticar construção de acordes, graus, campo harmônico e transposição usando músicas do repertório.' when 'ritmo' then 'Estudar com metrônomo, contar subdivisões em voz alta e aplicar o exercício lentamente no instrumento.' when 'percepcao' then 'Treinar escuta comparativa de tônicas, intervalos, acordes e progressões em sessões curtas e frequentes.' when 'conjunto' then 'Observar forma, dinâmica, entradas e sinais durante o ensaio, ouvindo conscientemente os demais músicos.' when 'tecnica_especifica' then 'Isolar este fundamento no instrumento ou na voz, praticar lentamente e validar com o líder ou professor.' else 'Revisar este conteúdo e demonstrá-lo novamente em uma atividade prática.' end
          ));
        end if;
      elsif v_type = 'scale' then
        if not coalesce(v_raw_answer ~ '^[0-4]$', false) then raise exception 'Valor de escala inválido: %', v_id; end if;
        v_score := v_raw_answer::numeric / 4 * 100;
        v_self_total := v_self_total + 1;
        v_self_sum := v_self_sum + v_score;
        select coalesce(option.value->>'label', v_raw_answer) into v_display_answer from jsonb_array_elements(coalesce(v_question->'scale', '[]'::jsonb)) as option(value) where option.value->>'value' = v_raw_answer limit 1;
      elsif v_type = 'frequency' then
        if not coalesce(v_raw_answer ~ '^[0-3]$', false) or not exists (select 1 from jsonb_array_elements(coalesce(v_question->'options', '[]'::jsonb)) as option(value) where option.value->>'value' = v_raw_answer) then raise exception 'Frequência inválida: %', v_id; end if;
        v_score := v_raw_answer::numeric / 3 * 100;
        v_self_total := v_self_total + 1;
        v_self_sum := v_self_sum + v_score;
        select coalesce(option.value->>'label', v_raw_answer) into v_display_answer from jsonb_array_elements(coalesce(v_question->'options', '[]'::jsonb)) as option(value) where option.value->>'value' = v_raw_answer limit 1;
      elsif v_type = 'single' then
        if not exists (select 1 from jsonb_array_elements_text(coalesce(v_question->'options', '[]'::jsonb)) as option(value) where option.value = v_raw_answer) then raise exception 'Opção inválida: %', v_id; end if;
      elsif v_type = 'email' then
        v_raw_answer := btrim(v_raw_answer);
        v_display_answer := v_raw_answer;
        if not coalesce(lower(v_raw_answer) ~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$', false) then raise exception 'E-mail inválido: %', v_id; end if;
      elsif v_type = 'number' then
        if not coalesce(v_raw_answer ~ '^-?[0-9]+([.][0-9]+)?$', false) then raise exception 'Número inválido: %', v_id; end if;
      elsif v_type is null or v_type not in ('text','textarea') then
        raise exception 'Formato de pergunta inválido: %', v_id;
      end if;

      v_snapshot := v_snapshot || jsonb_build_array(jsonb_build_object('id', v_id, 'question', coalesce(v_question->>'text', v_id), 'answer', coalesce(v_display_answer, v_raw_answer, ''), 'type', v_type));
      if v_score is not null and v_category = any(v_categories) then
        v_category_sums := jsonb_set(v_category_sums, array[v_category], to_jsonb((v_category_sums->>v_category)::numeric + v_score));
        v_category_counts := jsonb_set(v_category_counts, array[v_category], to_jsonb((v_category_counts->>v_category)::integer + 1));
      end if;
    end loop;
  end loop;

  foreach v_category in array v_categories
  loop
    if (v_category_counts->>v_category)::integer > 0 then
      v_scores := v_scores || jsonb_build_object(v_category, round((v_category_sums->>v_category)::numeric / (v_category_counts->>v_category)::integer));
    else
      v_scores := v_scores || jsonb_build_object(v_category, null);
    end if;
  end loop;
  v_demonstrated := case when v_objective_total > 0 then round(v_objective_sum / v_objective_total) else 0 end;
  v_self_assessment := case when v_self_total > 0 then round(v_self_sum / v_self_total) else 0 end;
  v_general := round(v_demonstrated * 0.65 + v_self_assessment * 0.35);
  v_scores := v_scores || jsonb_build_object('demonstrado', v_demonstrated, 'autoavaliacao', v_self_assessment, 'geral', v_general);

  insert into public.submissions (client_submission_id, participant_name, participant_email, instrument, assessment_version, question_bank_revision, answers, answer_snapshot, scores, review_items, plan, status)
  values (p_client_submission_id, v_name, v_email, v_instrument, left(coalesce(p_assessment_version, '3.0'), 30), p_question_bank_revision, p_answers, v_snapshot, v_scores, v_reviews, p_plan, 'new');

  return jsonb_build_object('id', p_client_submission_id::text, 'scores', v_scores, 'review_items', v_reviews, 'duplicate', false);
exception
  when unique_violation then
    select scores, review_items into v_existing_scores, v_existing_reviews from public.submissions where client_submission_id = p_client_submission_id;
    return jsonb_build_object('id', p_client_submission_id::text, 'scores', v_existing_scores, 'review_items', v_existing_reviews, 'duplicate', true);
end;
$$;

revoke all on function public.submit_diagnosis(uuid, uuid, jsonb, jsonb, jsonb, text) from public, anon, authenticated;
grant execute on function public.submit_diagnosis(uuid, uuid, jsonb, jsonb, jsonb, text) to anon, authenticated;

insert into public.question_banks (id, data)
values (1, '[]'::jsonb)
on conflict (id) do nothing;

insert into private.question_banks (id, data, revision, updated_at, updated_by)
select id, data, revision, updated_at, updated_by from public.question_banks where id = 1
on conflict (id) do nothing;

insert into private.question_bank_versions (revision, data, published_at, published_by)
select revision, data, updated_at, updated_by from private.question_banks where id = 1
on conflict (revision) do nothing;

update public.question_banks as public_bank
set data = private.sanitize_question_bank(private_bank.data),
    revision = private_bank.revision,
    updated_at = private_bank.updated_at,
    updated_by = private_bank.updated_by
from private.question_banks as private_bank
where public_bank.id = private_bank.id;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'question-audio',
  'question-audio',
  true,
  20971520,
  array['audio/mpeg','audio/mp3','audio/wav','audio/x-wav','audio/mp4','audio/x-m4a','audio/aac','audio/x-aac','audio/ogg','audio/webm']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins upload question audio" on storage.objects;
create policy "Admins upload question audio" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'question-audio' and (select public.is_admin()));

drop policy if exists "Admins inspect question audio" on storage.objects;
create policy "Admins inspect question audio" on storage.objects
  for select to authenticated
  using (bucket_id = 'question-audio' and (select public.is_admin()));

drop policy if exists "Admins update question audio" on storage.objects;
create policy "Admins update question audio" on storage.objects
  for update to authenticated
  using (bucket_id = 'question-audio' and (select public.is_admin()))
  with check (bucket_id = 'question-audio' and (select public.is_admin()));

drop policy if exists "Admins delete question audio" on storage.objects;
create policy "Admins delete question audio" on storage.objects
  for delete to authenticated
  using (bucket_id = 'question-audio' and (select public.is_admin()));

-- Depois de criar seu usuario em Authentication > Users, execute uma vez:
-- insert into public.admins (user_id)
-- select id from auth.users where email = 'SEU_EMAIL';
