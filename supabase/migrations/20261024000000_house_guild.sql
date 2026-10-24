-- 가문 가입 제도 1단계 + 주간 가문 순위 효과
--  · 누구나 가문에 들어갈 수 있다 (가주 1 / 원로 최대 3 / 가문원, 정원 30)
--  · 가문원 모두의 판이 족보·가문 점수에 쌓이고, 유산은 가문원 모두의 판에 붙는다
--  · 지난주(월요일 0시 마감, 한국 시간) 주간 점수 순위로 이번 주 효과: 1위 h1, 2위 h2, 3위 h3, 4~10위 h4
--  · 효과를 받는 주에는 주간 점수가 덜 쌓인다 (1위 ×0.8, 2·3위 ×0.9) — 1위 굳히기 방지
--  · 가문을 떠나면 24시간 동안 다른 가문에 들어갈 수 없다

create table if not exists public.house_users (
  user_id   uuid primary key references auth.users(id) on delete cascade,
  house_id  bigint not null references public.houses(id) on delete cascade,
  role      text not null default 'member' check (role in ('leader', 'elder', 'member')),
  joined_at timestamptz not null default now()
);
create index if not exists house_users_house_idx on public.house_users (house_id);
insert into public.house_users (user_id, house_id, role, joined_at)
  select owner, id, 'leader', created_at from public.houses on conflict (user_id) do nothing;

create table if not exists public.house_apps (
  house_id   bigint not null references public.houses(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (house_id, user_id)
);
create table if not exists public.house_left (
  user_id uuid primary key,
  left_at timestamptz not null default now()
);
create table if not exists public.house_week (
  week_start date not null,
  house_id   bigint not null references public.houses(id) on delete cascade,
  points     bigint not null default 0,
  primary key (week_start, house_id)
);

alter table public.houses add column if not exists open boolean not null default false;
alter table public.houses add column if not exists notice text not null default '';
alter table public.house_members add column if not exists user_id uuid;
alter table public.house_members add column if not exists nickname text;

alter table public.house_users enable row level security;
alter table public.house_apps enable row level security;
alter table public.house_left enable row level security;
alter table public.house_week enable row level security;
drop policy if exists "house users readable" on public.house_users;
create policy "house users readable" on public.house_users for select to anon, authenticated using (true);
drop policy if exists "house week readable" on public.house_week;
create policy "house week readable" on public.house_week for select to anon, authenticated using (true);
-- house_apps, house_left: 아래 함수로만 다룬다

create or replace function public.kst_week(p_at timestamptz default now())
returns date language sql stable as $$ select date_trunc('week', (p_at at time zone 'Asia/Seoul'))::date $$;

-- p_week 주에 그 가문이 받는 효과 (그 전 주 주간 점수 순위로 정한다). 0이면 없음.
create or replace function public.house_tier(p_house bigint, p_week date default null)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  with w as (select coalesce(p_week, kst_week()) - 7 as prev),
  r as (select house_id, row_number() over (order by points desc, house_id) as rk
        from house_week, w where week_start = w.prev and points > 0)
  select coalesce((select case when rk = 1 then 1 when rk = 2 then 2 when rk = 3 then 3 when rk <= 10 then 4 else 0 end
                   from r where house_id = p_house), 0)
$$;

create or replace function public.house_count(p_house bigint)
returns integer language sql stable security definer set search_path = public as
$$ select count(*)::int from house_users where house_id = p_house $$;

-- 족보에 올리기: 그 사람이 속한 가문으로 (서버 전용)
create or replace function public.house_add_member(p_owner uuid, p_seed bigint, p_hero text, p_race text, p_reach text, p_score double precision, p_kills bigint, p_power bigint, p_alive boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  hid bigint;
  g integer;
  pts integer := house_points(p_score);
  t integer;
  wk integer;
  nick text;
begin
  select house_id into hid from house_users where user_id = p_owner;
  if hid is null then return null; end if;
  perform 1 from houses where id = hid for update;
  if exists (select 1 from house_members where seed = p_seed) then return json_build_object('dup', true); end if;
  t := house_tier(hid);
  wk := floor(pts * case when t = 1 then 0.8 when t in (2, 3) then 0.9 else 1 end)::integer;
  insert into house_week (week_start, house_id, points) values (kst_week(), hid, wk)
    on conflict (week_start, house_id) do update set points = house_week.points + excluded.points;
  select nickname into nick from profiles where id = p_owner;
  if p_score < 50 then
    update houses set unnamed = unnamed + 1, score = score + pts where id = hid;
    return json_build_object('unnamed', true, 'points', pts, 'week', wk);
  end if;
  select coalesce(max(gen), 0) + 1 into g from house_members where house_id = hid;
  insert into house_members (house_id, gen, seed, hero, race, reach, reach_score, kills, power, alive, points, user_id, nickname)
    values (hid, g, p_seed, p_hero, p_race, p_reach, p_score, p_kills, p_power, p_alive, pts, p_owner, nick);
  update houses set score = score + pts where id = hid;
  return json_build_object('gen', g, 'points', pts, 'week', wk);
end;
$$;

-- 서버(submit-run) 전용: 그 사람의 가문 유산과, 판을 시작한 시각 기준 가문 순위 효과
create or replace function public.user_house_info(p_user uuid, p_at timestamptz default now())
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare u house_users; h houses;
begin
  select * into u from house_users where user_id = p_user;
  if u.house_id is null then return null; end if;
  select * into h from houses where id = u.house_id;
  return json_build_object('house_id', h.id, 'legacy', h.legacy, 'tier', house_tier(h.id, kst_week(p_at)),
    'eligible', u.joined_at <= p_at - interval '24 hours', 'role', u.role);
end;
$$;

-- 가문 세우기 / 고치기: 가문이 없으면 새로 세워 가주가 되고, 있으면 가주만 고칠 수 있다
create or replace function public.save_house(p_name text, p_crest jsonb, p_crest_url text, p_color1 text, p_color2 text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  nm text := left(btrim(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]<>]', '', 'g')), 12);
  other bigint;
  u house_users;
  h public.houses;
  c1 text := case when p_color1 ~ '^#[0-9a-fA-F]{6}$' then p_color1 else '#b8862b' end;
  c2 text := case when p_color2 ~ '^#[0-9a-fA-F]{6}$' then p_color2 else '#3a1a1a' end;
  url text := case when p_crest_url like '%/storage/v1/object/public/crests/' || auth.uid()::text || '%' then p_crest_url else null end;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', '가입이 필요하다'); end if;
  if char_length(nm) < 2 then return json_build_object('ok', false, 'error', '가문 이름은 2~12자다'); end if;
  select * into u from house_users where user_id = auth.uid();
  if u.house_id is not null and u.role <> 'leader' then return json_build_object('ok', false, 'error', '가주만 가문을 고칠 수 있다'); end if;
  select id into other from houses where lower(name) = lower(nm) and id is distinct from u.house_id;
  if other is not null then return json_build_object('ok', false, 'error', '이미 있는 가문 이름이다'); end if;
  if u.house_id is null then
    insert into houses (owner, name, crest, crest_url, color1, color2)
      values (auth.uid(), nm, coalesce(p_crest, '{}'::jsonb), url, c1, c2) returning * into h;
    insert into house_users (user_id, house_id, role) values (auth.uid(), h.id, 'leader');
    delete from house_apps where user_id = auth.uid();
  else
    update houses set name = nm, crest = coalesce(p_crest, '{}'::jsonb),
      crest_url = coalesce(url, case when p_crest ? 'keepUrl' then crest_url else null end),
      crest_hidden = case when url is not null then false else crest_hidden end,
      color1 = c1, color2 = c2
    where id = u.house_id returning * into h;
  end if;
  return json_build_object('ok', true, 'id', h.id, 'name', h.name);
end;
$$;

-- 내 가문 (없으면 null). 가주·원로에게는 가입 신청 목록도
create or replace function public.my_house()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare u house_users; h houses; apps json;
begin
  if auth.uid() is null then return null; end if;
  select * into u from house_users where user_id = auth.uid();
  if u.house_id is null then
    return json_build_object('house', null, 'applied', (select coalesce(json_agg(house_id), '[]'::json) from house_apps where user_id = auth.uid()),
      'left_at', (select left_at from house_left where user_id = auth.uid()));
  end if;
  select * into h from houses where id = u.house_id;
  if u.role in ('leader', 'elder') then
    select coalesce(json_agg(json_build_object('user_id', a.user_id, 'nickname', p.nickname, 'at', a.created_at) order by a.created_at), '[]'::json)
      into apps from house_apps a left join profiles p on p.id = a.user_id where a.house_id = h.id;
  end if;
  return json_build_object('house', json_build_object('id', h.id, 'name', h.name, 'crest', h.crest, 'crest_url', h.crest_url, 'crest_hidden', h.crest_hidden,
      'color1', h.color1, 'color2', h.color2, 'unnamed', h.unnamed, 'score', h.score, 'spent', h.spent, 'legacy', h.legacy, 'open', h.open, 'notice', h.notice),
    'role', u.role, 'joined_at', u.joined_at, 'tier', house_tier(h.id), 'eligible', u.joined_at <= now() - interval '24 hours',
    'week_points', (select points from house_week where house_id = h.id and week_start = kst_week()), 'people', house_count(h.id), 'apps', apps);
end;
$$;

-- 가문 사람들 (누구나 볼 수 있다): 닉네임·직위·가입일·이번 주에 쌓은 점수
create or replace function public.house_roster(p_house bigint)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(json_agg(json_build_object('user_id', u.user_id, 'nickname', coalesce(p.nickname, '이름 없는 가문원'), 'role', u.role, 'joined_at', u.joined_at,
    'week', (select coalesce(sum(m.points), 0) from house_members m where m.house_id = u.house_id and m.user_id = u.user_id and m.created_at >= (kst_week()::timestamp at time zone 'Asia/Seoul')))
    order by case u.role when 'leader' then 0 when 'elder' then 1 else 2 end, u.joined_at), '[]'::json)
  from house_users u left join profiles p on p.id = u.user_id where u.house_id = p_house
$$;

-- 가입: 자유 가입 가문이면 바로, 아니면 신청
create or replace function public.house_join(p_house bigint)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare h houses; l timestamptz;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', '로그인이 필요하다'); end if;
  if exists (select 1 from house_users where user_id = auth.uid()) then return json_build_object('ok', false, 'error', '이미 가문에 속해 있다'); end if;
  select left_at into l from house_left where user_id = auth.uid();
  if l is not null and l > now() - interval '24 hours' then
    return json_build_object('ok', false, 'error', '가문을 떠난 지 24시간이 지나야 다른 가문에 들어갈 수 있다', 'until', l + interval '24 hours'); end if;
  select * into h from houses where id = p_house for update;
  if h.id is null then return json_build_object('ok', false, 'error', '없는 가문이다'); end if;
  if house_count(h.id) >= 30 then return json_build_object('ok', false, 'error', '정원(30명)이 찼다'); end if;
  if h.open then
    insert into house_users (user_id, house_id, role) values (auth.uid(), h.id, 'member');
    delete from house_apps where user_id = auth.uid();
    return json_build_object('ok', true, 'joined', true);
  end if;
  if (select count(*) from house_apps where user_id = auth.uid()) >= 3 then return json_build_object('ok', false, 'error', '가입 신청은 한 번에 3곳까지다'); end if;
  insert into house_apps (house_id, user_id) values (h.id, auth.uid()) on conflict do nothing;
  return json_build_object('ok', true, 'applied', true);
end;
$$;

create or replace function public.house_cancel_app(p_house bigint)
returns json language plpgsql security definer set search_path = public as $$
begin
  delete from house_apps where house_id = p_house and user_id = auth.uid();
  return json_build_object('ok', true);
end; $$;

-- 가입 신청 받기·거절 (가주·원로)
create or replace function public.house_decide(p_user uuid, p_ok boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare me house_users;
begin
  select * into me from house_users where user_id = auth.uid();
  if me.role is null or me.role not in ('leader', 'elder') then return json_build_object('ok', false, 'error', '가주나 원로만 할 수 있다'); end if;
  perform 1 from houses where id = me.house_id for update;
  if not exists (select 1 from house_apps where house_id = me.house_id and user_id = p_user) then return json_build_object('ok', false, 'error', '신청이 없다'); end if;
  delete from house_apps where house_id = me.house_id and user_id = p_user;
  if not p_ok then return json_build_object('ok', true, 'rejected', true); end if;
  if exists (select 1 from house_users where user_id = p_user) then return json_build_object('ok', false, 'error', '이미 다른 가문에 들어갔다'); end if;
  if house_count(me.house_id) >= 30 then return json_build_object('ok', false, 'error', '정원(30명)이 찼다'); end if;
  insert into house_users (user_id, house_id, role) values (p_user, me.house_id, 'member');
  delete from house_apps where user_id = p_user;
  return json_build_object('ok', true, 'joined', true);
end;
$$;

-- 떠나기: 가주는 혼자 남았을 때만 (그러면 가문이 사라진다). 다른 사람이 있으면 가주를 넘기고 떠난다.
create or replace function public.house_leave()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare me house_users;
begin
  select * into me from house_users where user_id = auth.uid();
  if me.house_id is null then return json_build_object('ok', false, 'error', '가문에 속해 있지 않다'); end if;
  if me.role = 'leader' then
    if house_count(me.house_id) > 1 then return json_build_object('ok', false, 'error', '가주를 다른 사람에게 넘긴 뒤 떠날 수 있다'); end if;
    delete from houses where id = me.house_id;
    return json_build_object('ok', true, 'disbanded', true);
  end if;
  delete from house_users where user_id = auth.uid();
  insert into house_left (user_id, left_at) values (auth.uid(), now()) on conflict (user_id) do update set left_at = now();
  return json_build_object('ok', true);
end;
$$;

-- 내보내기: 가주는 원로·가문원을, 원로는 가문원만
create or replace function public.house_kick(p_user uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare me house_users; t house_users;
begin
  select * into me from house_users where user_id = auth.uid();
  select * into t from house_users where user_id = p_user;
  if me.house_id is null or t.house_id is distinct from me.house_id or p_user = auth.uid() then return json_build_object('ok', false, 'error', '내보낼 수 없다'); end if;
  if not (me.role = 'leader' or (me.role = 'elder' and t.role = 'member')) then return json_build_object('ok', false, 'error', '권한이 없다'); end if;
  delete from house_users where user_id = p_user;
  insert into house_left (user_id, left_at) values (p_user, now()) on conflict (user_id) do update set left_at = now();
  return json_build_object('ok', true);
end;
$$;

-- 직위 바꾸기 (가주만): elder / member / leader(가주 넘기기)
create or replace function public.house_set_role(p_user uuid, p_role text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare me house_users; t house_users;
begin
  select * into me from house_users where user_id = auth.uid();
  select * into t from house_users where user_id = p_user;
  if me.role is distinct from 'leader' or t.house_id is distinct from me.house_id or p_user = auth.uid() then return json_build_object('ok', false, 'error', '가주만 다른 가문원의 직위를 바꿀 수 있다'); end if;
  if p_role not in ('leader', 'elder', 'member') then return json_build_object('ok', false, 'error', '없는 직위다'); end if;
  if p_role = 'elder' and (select count(*) from house_users where house_id = me.house_id and role = 'elder' and user_id <> p_user) >= 3 then
    return json_build_object('ok', false, 'error', '원로는 3명까지다'); end if;
  if p_role = 'leader' then
    update house_users set role = 'elder' where user_id = auth.uid();
    update house_users set role = 'leader' where user_id = p_user;
    update houses set owner = p_user where id = me.house_id;
  else
    update house_users set role = p_role where user_id = p_user;
  end if;
  return json_build_object('ok', true);
end;
$$;

-- 가입 방식·공지 (가주만)
create or replace function public.house_settings(p_open boolean, p_notice text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare me house_users;
begin
  select * into me from house_users where user_id = auth.uid();
  if me.role is distinct from 'leader' then return json_build_object('ok', false, 'error', '가주만 바꿀 수 있다'); end if;
  update houses set open = coalesce(p_open, open), notice = left(regexp_replace(coalesce(p_notice, notice), '[[:cntrl:]<>]', '', 'g'), 120) where id = me.house_id;
  return json_build_object('ok', true);
end;
$$;

-- 유산 사기: 가주·원로가 가문 점수로. 가문원이 많을수록 비싸진다 (10명마다 +50%)
create or replace function public.buy_legacy(p_key text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  me house_users;
  h public.houses;
  costs jsonb := '{"vault":[30,60,120],"arms":[60,150],"bless":[80,200],"train":[50,120],"name":[40]}';
  lv integer;
  c integer;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', '로그인이 필요하다'); end if;
  if not (costs ? p_key) then return json_build_object('ok', false, 'error', '없는 유산이다'); end if;
  select * into me from house_users where user_id = auth.uid();
  if me.house_id is null then return json_build_object('ok', false, 'error', '가문이 없다'); end if;
  if me.role not in ('leader', 'elder') then return json_build_object('ok', false, 'error', '가주나 원로만 유산을 살 수 있다'); end if;
  select * into h from houses where id = me.house_id for update;
  lv := coalesce((h.legacy ->> p_key)::integer, 0);
  if lv >= jsonb_array_length(costs -> p_key) then return json_build_object('ok', false, 'error', '이미 끝까지 올렸다'); end if;
  c := ceil((costs -> p_key ->> lv)::integer * (1 + 0.5 * floor((house_count(h.id) - 1) / 10.0)))::integer;
  if h.score - h.spent < c then return json_build_object('ok', false, 'error', '가문 점수가 모자란다'); end if;
  update houses set spent = spent + c, legacy = jsonb_set(legacy, array[p_key], to_jsonb(lv + 1)) where id = h.id returning * into h;
  return json_build_object('ok', true, 'legacy', h.legacy, 'score', h.score, 'spent', h.spent, 'cost', c);
end;
$$;

-- 가문 랭킹: 사람 수·이번 주 점수·이번 주 순위 효과 포함
drop view if exists public.house_rank;
create view public.house_rank with (security_invoker = true) as
select h.id, h.name, h.crest, h.crest_url, h.crest_hidden, h.color1, h.color2, h.score, h.unnamed, h.open, h.notice,
  (select coalesce(sum((v)::integer), 0) from jsonb_each_text(h.legacy) as t(k, v)) as legacy_lv,
  (select count(*)::int from public.house_members m where m.house_id = h.id) as members,
  (select count(*)::int from public.house_users u where u.house_id = h.id) as people,
  coalesce((select w.points from public.house_week w where w.house_id = h.id and w.week_start = public.kst_week()), 0) as week_points,
  public.house_tier(h.id) as tier,
  coalesce((select max(m.reach_score) from public.house_members m where m.house_id = h.id), 0) as best_score,
  (select m.hero from public.house_members m where m.house_id = h.id order by m.reach_score desc limit 1) as best_hero,
  (select m.reach from public.house_members m where m.house_id = h.id order by m.reach_score desc limit 1) as best_reach
from public.houses h;
grant select on public.house_rank to anon, authenticated;

revoke all on function public.house_add_member(uuid, bigint, text, text, text, double precision, bigint, bigint, boolean) from public, anon, authenticated;
grant execute on function public.house_add_member(uuid, bigint, text, text, text, double precision, bigint, bigint, boolean) to service_role;
revoke all on function public.user_house_info(uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.user_house_info(uuid, timestamptz) to service_role;
revoke all on function public.my_house() from public, anon;
grant execute on function public.my_house() to authenticated;
grant execute on function public.house_roster(bigint) to anon, authenticated;
grant execute on function public.house_tier(bigint, date) to anon, authenticated;
grant execute on function public.house_count(bigint) to anon, authenticated;
grant execute on function public.kst_week(timestamptz) to anon, authenticated;
revoke all on function public.house_join(bigint) from public, anon;
grant execute on function public.house_join(bigint) to authenticated;
revoke all on function public.house_cancel_app(bigint) from public, anon;
grant execute on function public.house_cancel_app(bigint) to authenticated;
revoke all on function public.house_decide(uuid, boolean) from public, anon;
grant execute on function public.house_decide(uuid, boolean) to authenticated;
revoke all on function public.house_leave() from public, anon;
grant execute on function public.house_leave() to authenticated;
revoke all on function public.house_kick(uuid) from public, anon;
grant execute on function public.house_kick(uuid) to authenticated;
revoke all on function public.house_set_role(uuid, text) from public, anon;
grant execute on function public.house_set_role(uuid, text) to authenticated;
revoke all on function public.house_settings(boolean, text) from public, anon;
grant execute on function public.house_settings(boolean, text) to authenticated;
revoke all on function public.save_house(text, jsonb, text, text, text) from public, anon;
grant execute on function public.save_house(text, jsonb, text, text, text) to authenticated;
revoke all on function public.buy_legacy(text) from public, anon;
grant execute on function public.buy_legacy(text) to authenticated;
