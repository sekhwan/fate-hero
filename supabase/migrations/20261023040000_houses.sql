-- 가문 2단계: 가문(이름·문장·색), 족보, 문장 업로드 저장소
-- 가문은 가입한 계정 하나에 하나. 족보는 서버가 검증한 판 요약으로만 쌓인다 (submit-run이 쓴다).

create table if not exists public.houses (
  id           bigserial primary key,
  owner        uuid not null unique references auth.users(id) on delete cascade,
  name         text not null check (char_length(name) between 2 and 12),
  crest        jsonb not null default '{}'::jsonb,   -- 조합 문장 {shape, sym}
  crest_url    text,                                 -- 올린 문장 그림 (있으면 이것을 보여 준다)
  crest_hidden boolean not null default false,       -- 관리자가 내린 그림
  color1       text not null default '#b8862b',
  color2       text not null default '#3a1a1a',
  score        bigint not null default 0,            -- 3단계: 가문 점수 (누적)
  spent        bigint not null default 0,            -- 3단계: 유산에 쓴 점수
  legacy       jsonb not null default '{}'::jsonb,   -- 3단계: 유산 단계
  unnamed      integer not null default 0,           -- 첫 지역을 넘기지 못하고 쓰러진 용사 수
  created_at   timestamptz not null default now()
);
create unique index if not exists houses_name_uq on public.houses (lower(name));

create table if not exists public.house_members (
  house_id    bigint not null references public.houses(id) on delete cascade,
  gen         integer not null,
  seed        bigint not null unique,
  hero        text not null,
  race        text not null,
  reach       text not null,
  reach_score double precision not null default 0,
  kills       bigint not null default 0,
  power       bigint not null default 0,
  alive       boolean not null default false,
  created_at  timestamptz not null default now(),
  primary key (house_id, gen)
);

alter table public.houses enable row level security;
alter table public.house_members enable row level security;
drop policy if exists "houses readable" on public.houses;
create policy "houses readable" on public.houses for select to anon, authenticated using (true);
drop policy if exists "house members readable" on public.house_members;
create policy "house members readable" on public.house_members for select to anon, authenticated using (true);

-- 가문 세우기 / 고치기 (이름·문장·색). 이름이 겹치면 거절.
create or replace function public.save_house(p_name text, p_crest jsonb, p_crest_url text, p_color1 text, p_color2 text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  nm text := left(btrim(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]<>]', '', 'g')), 12);
  other bigint;
  h public.houses;
  c1 text := case when p_color1 ~ '^#[0-9a-fA-F]{6}$' then p_color1 else '#b8862b' end;
  c2 text := case when p_color2 ~ '^#[0-9a-fA-F]{6}$' then p_color2 else '#3a1a1a' end;
  url text := case when p_crest_url like '%/storage/v1/object/public/crests/' || auth.uid()::text || '%' then p_crest_url else null end;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', '가입이 필요하다'); end if;
  if char_length(nm) < 2 then return json_build_object('ok', false, 'error', '가문 이름은 2~12자다'); end if;
  select id into other from houses where lower(name) = lower(nm) and owner <> auth.uid();
  if other is not null then return json_build_object('ok', false, 'error', '이미 있는 가문 이름이다'); end if;
  insert into houses (owner, name, crest, crest_url, color1, color2)
    values (auth.uid(), nm, coalesce(p_crest, '{}'::jsonb), url, c1, c2)
    on conflict (owner) do update set name = excluded.name, crest = excluded.crest,
      crest_url = coalesce(excluded.crest_url, case when excluded.crest ? 'keepUrl' then houses.crest_url else null end),
      crest_hidden = case when excluded.crest_url is not null then false else houses.crest_hidden end,
      color1 = excluded.color1, color2 = excluded.color2
    returning * into h;
  return json_build_object('ok', true, 'id', h.id, 'name', h.name);
end;
$$;

-- 서버(submit-run) 전용: 끝난 판을 족보에 올린다. 같은 판(seed)은 한 번만.
create or replace function public.house_add_member(p_owner uuid, p_seed bigint, p_hero text, p_race text, p_reach text, p_score double precision, p_kills bigint, p_power bigint, p_alive boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.houses;
  g integer;
begin
  select * into h from houses where owner = p_owner for update;
  if h.id is null then return null; end if;
  if exists (select 1 from house_members where seed = p_seed) then return json_build_object('dup', true); end if;
  -- 첫 지역을 넘기지 못한 판은 이름 없이 숫자로만 센다
  if p_score < 50 then
    update houses set unnamed = unnamed + 1 where id = h.id;
    return json_build_object('unnamed', true);
  end if;
  select coalesce(max(gen), 0) + 1 into g from house_members where house_id = h.id;
  insert into house_members (house_id, gen, seed, hero, race, reach, reach_score, kills, power, alive)
    values (h.id, g, p_seed, p_hero, p_race, p_reach, p_score, p_kills, p_power, p_alive);
  return json_build_object('gen', g);
end;
$$;

revoke all on function public.save_house(text, jsonb, text, text, text) from public, anon;
grant execute on function public.save_house(text, jsonb, text, text, text) to authenticated;
revoke all on function public.house_add_member(uuid, bigint, text, text, text, double precision, bigint, bigint, boolean) from public, anon, authenticated;
grant execute on function public.house_add_member(uuid, bigint, text, text, text, double precision, bigint, bigint, boolean) to service_role;

-- 문장 그림 저장소: 누구나 볼 수 있고, 자기 이름(<계정 id>.webp)으로만 올린다. 256KB 이하 그림만.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('crests', 'crests', true, 262144, array['image/webp','image/png','image/jpeg'])
  on conflict (id) do update set public = true, file_size_limit = 262144, allowed_mime_types = array['image/webp','image/png','image/jpeg'];
drop policy if exists "crest upload own" on storage.objects;
create policy "crest upload own" on storage.objects for insert to authenticated
  with check (bucket_id = 'crests' and name = auth.uid()::text || '.webp');
drop policy if exists "crest update own" on storage.objects;
create policy "crest update own" on storage.objects for update to authenticated
  using (bucket_id = 'crests' and name = auth.uid()::text || '.webp')
  with check (bucket_id = 'crests' and name = auth.uid()::text || '.webp');
drop policy if exists "crest read" on storage.objects;
create policy "crest read" on storage.objects for select to anon, authenticated using (bucket_id = 'crests');
