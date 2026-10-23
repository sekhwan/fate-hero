-- 계정(이메일·비밀번호 가입) 1단계: 프로필, 닉네임 소유, 연대기 저장
-- 가입하지 않은 손님은 지금처럼 그대로 플레이한다 (기록은 브라우저에만).
-- 가입한 사람의 닉네임은 그 사람 것이 되고, 다른 사람은 그 닉네임으로 랭킹에 등록할 수 없다.

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nickname   text,
  chron      jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists profiles_nick_uq on public.profiles (lower(nickname)) where nickname is not null;

alter table public.profiles enable row level security;
drop policy if exists "own profile readable" on public.profiles;
create policy "own profile readable" on public.profiles for select to authenticated using (id = auth.uid());
-- 쓰기는 아래 함수로만 한다

alter table public.runs add column if not exists user_id uuid;

-- 내 프로필 (없으면 만든다)
create or replace function public.my_profile()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare p public.profiles;
begin
  if auth.uid() is null then return null; end if;
  insert into profiles (id) values (auth.uid()) on conflict (id) do nothing;
  select * into p from profiles where id = auth.uid();
  return json_build_object('nickname', p.nickname, 'chron', p.chron);
end;
$$;

-- 닉네임 정하기: 비어 있는 닉네임이거나 이미 내 것이면 성공
create or replace function public.claim_nickname(p_nick text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  nick text := left(btrim(regexp_replace(coalesce(p_nick, ''), '[[:cntrl:]<>]', '', 'g')), 12);
  owner uuid;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', '로그인이 필요하다'); end if;
  if char_length(nick) < 1 then return json_build_object('ok', false, 'error', '닉네임을 입력해 주세요'); end if;
  select id into owner from profiles where lower(nickname) = lower(nick);
  if owner is not null and owner <> auth.uid() then return json_build_object('ok', false, 'error', '이미 다른 사람이 가입해 쓰는 닉네임이다'); end if;
  insert into profiles (id, nickname) values (auth.uid(), nick)
    on conflict (id) do update set nickname = excluded.nickname, updated_at = now();
  return json_build_object('ok', true, 'nickname', nick);
end;
$$;

-- 연대기 저장 (브라우저 기록과 합친 결과를 통째로 올린다, 최대 200KB)
create or replace function public.save_chron(p_chron jsonb)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or p_chron is null or octet_length(p_chron::text) > 200000 then return false; end if;
  insert into profiles (id, chron) values (auth.uid(), p_chron)
    on conflict (id) do update set chron = excluded.chron, updated_at = now();
  return true;
end;
$$;

-- 서버(submit-run) 전용: 이 닉네임의 주인 (없으면 null)
create or replace function public.nick_owner(p_nick text)
returns uuid
language sql
stable
security definer
set search_path = public
as $$ select id from profiles where lower(nickname) = lower(btrim(p_nick)) limit 1 $$;

revoke all on function public.my_profile() from public, anon;
revoke all on function public.claim_nickname(text) from public, anon;
revoke all on function public.save_chron(jsonb) from public, anon;
revoke all on function public.nick_owner(text) from public, anon, authenticated;
grant execute on function public.my_profile() to authenticated;
grant execute on function public.claim_nickname(text) to authenticated;
grant execute on function public.save_chron(jsonb) to authenticated;
grant execute on function public.nick_owner(text) to service_role;
