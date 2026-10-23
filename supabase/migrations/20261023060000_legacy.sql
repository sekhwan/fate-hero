-- 가문 3단계: 가문 점수, 유산 상점, 월드 보스 보상을 계정 단위로
--
-- 가문 점수 (족보에 오르는 판마다, 서버가 검증한 도달 점수로 계산)
--   정복한 세계마다 20 + 10 × 세계 번호 (지상계 30, 지하 세계 40, 마계 50, 심연 60, 공허의 옥좌 70)
--   진행 중인 세계는 약 10%마다 세계 번호만큼
--   끝없는 전장은 250 + 10층마다 5

alter table public.house_members add column if not exists points integer not null default 0;
alter table public.runs add column if not exists legacy_lv integer not null default 0;

create or replace function public.house_points(p_score double precision)
returns integer
language plpgsql
immutable
as $$
declare
  w integer; rem double precision; pts integer := 0;
begin
  if p_score is null or p_score <= 0 then return 0; end if;
  if p_score >= 5000 then return 250 + 5 * floor((p_score - 5000) / 10)::integer; end if;
  w := floor(p_score / 1000)::integer; rem := p_score - w * 1000;
  for i in 0 .. w - 1 loop pts := pts + 20 + 10 * (i + 1); end loop;
  if rem >= 990 then pts := pts + 20 + 10 * (w + 1);
  else pts := pts + floor(rem / 98)::integer * (w + 1); end if;
  return pts;
end;
$$;

create or replace function public.house_add_member(p_owner uuid, p_seed bigint, p_hero text, p_race text, p_reach text, p_score double precision, p_kills bigint, p_power bigint, p_alive boolean)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.houses;
  g integer;
  pts integer := house_points(p_score);
begin
  select * into h from houses where owner = p_owner for update;
  if h.id is null then return null; end if;
  if exists (select 1 from house_members where seed = p_seed) then return json_build_object('dup', true); end if;
  if p_score < 50 then
    update houses set unnamed = unnamed + 1, score = score + pts where id = h.id;
    return json_build_object('unnamed', true, 'points', pts);
  end if;
  select coalesce(max(gen), 0) + 1 into g from house_members where house_id = h.id;
  insert into house_members (house_id, gen, seed, hero, race, reach, reach_score, kills, power, alive, points)
    values (h.id, g, p_seed, p_hero, p_race, p_reach, p_score, p_kills, p_power, p_alive, pts);
  update houses set score = score + pts where id = h.id;
  return json_build_object('gen', g, 'points', pts);
end;
$$;

-- 유산 사기: 단계마다 값이 오르고, 가진 점수(누적 − 쓴 점수)에서 뺀다
create or replace function public.buy_legacy(p_key text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  h public.houses;
  costs jsonb := '{"vault":[30,60,120],"arms":[60,150],"bless":[80,200],"train":[50,120],"name":[40]}';
  lv integer;
  c integer;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', '로그인이 필요하다'); end if;
  if not (costs ? p_key) then return json_build_object('ok', false, 'error', '없는 유산이다'); end if;
  select * into h from houses where owner = auth.uid() for update;
  if h.id is null then return json_build_object('ok', false, 'error', '가문이 없다'); end if;
  lv := coalesce((h.legacy ->> p_key)::integer, 0);
  if lv >= jsonb_array_length(costs -> p_key) then return json_build_object('ok', false, 'error', '이미 끝까지 올렸다'); end if;
  c := (costs -> p_key ->> lv)::integer;
  if h.score - h.spent < c then return json_build_object('ok', false, 'error', '가문 점수가 모자란다'); end if;
  update houses set spent = spent + c, legacy = jsonb_set(legacy, array[p_key], to_jsonb(lv + 1)) where id = h.id returning * into h;
  return json_build_object('ok', true, 'legacy', h.legacy, 'score', h.score, 'spent', h.spent);
end;
$$;

revoke all on function public.buy_legacy(text) from public, anon;
grant execute on function public.buy_legacy(text) to authenticated;

-- 가문 랭킹 (가문 점수 포함)
drop view if exists public.house_rank;
create view public.house_rank with (security_invoker = true) as
select h.id, h.name, h.crest, h.crest_url, h.crest_hidden, h.color1, h.color2, h.score, h.unnamed,
  (select coalesce(sum((v)::integer), 0) from jsonb_each_text(h.legacy) as t(k, v)) as legacy_lv,
  count(m.seed)::int as members,
  coalesce(max(m.reach_score), 0) as best_score,
  (array_agg(m.hero order by m.reach_score desc))[1] as best_hero,
  (array_agg(m.reach order by m.reach_score desc))[1] as best_reach
from public.houses h
left join public.house_members m on m.house_id = h.id
group by h.id;
grant select on public.house_rank to anon, authenticated;

-- 월드 보스 하루 3번 보상: 로그인한 사람은 계정 단위로 센다 (새 용사를 뽑아도 늘지 않는다)
create table if not exists public.world_boss_user (
  user_id       uuid primary key,
  reward_day    date,
  rewards_today integer not null default 0
);
alter table public.world_boss_user enable row level security;

drop function if exists public.wb_apply(bigint, text, text, bigint, integer, boolean, boolean);

create or replace function public.wb_apply(p_seed bigint, p_nick text, p_title text, p_kills bigint, p_stage integer, p_attack boolean, p_alive boolean, p_user uuid default null)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.world_boss;
  w double precision;
  sd public.world_boss_seed;
  counted bigint;
  dk bigint;
  h public.world_boss_hits;
  newdmg bigint;
  delta bigint := 0;
  killed_now boolean := false;
  rnk integer;
  nick text := left(btrim(coalesce(p_nick, '')), 12);
  today date := (now() at time zone 'Asia/Seoul')::date;
  cnt integer;
  codes text := '';
  x double precision;
  rw json := null;
  rw_left integer;
  rw_reason text := null;
  r_day date;
  r_today integer;
  rn integer;
begin
  if nick = '' then return null; end if;
  perform wb_current();
  select * into b from world_boss where week_start = date_trunc('week', (now() at time zone 'Asia/Seoul'))::date for update;
  w := case when coalesce(p_stage, 0) >= b.boss_idx then 1.5 else 1 end;

  insert into world_boss_seed (seed) values (p_seed) on conflict (seed) do nothing;
  select * into sd from world_boss_seed where seed = p_seed for update;

  if p_alive and not coalesce(p_attack, false) then
    return json_build_object('boss', b.boss_name, 'hp_max', b.hp_max, 'hp_left', b.hp_left, 'delta', 0, 'skipped', 'not_attack');
  end if;
  if p_alive and sd.last_attack_at is not null and sd.last_attack_at > now() - interval '1 hour' then
    return json_build_object('boss', b.boss_name, 'hp_max', b.hp_max, 'hp_left', b.hp_left, 'delta', 0, 'cooldown', true,
      'next_at', sd.last_attack_at + interval '1 hour');
  end if;

  counted := coalesce(sd.kills_counted, 0);
  dk := greatest(0, coalesce(p_kills, 0) - counted);
  update world_boss_seed set kills_counted = greatest(counted, coalesce(p_kills, 0)), updated_at = now() where seed = p_seed;

  select * into h from world_boss_hits where week_start = b.week_start and nickname = nick for update;
  if h.nickname is null and dk = 0 then
    return json_build_object('boss', b.boss_name, 'hp_max', b.hp_max, 'hp_left', b.hp_left, 'delta', 0, 'damage', 0,
      'rank', null, 'players', b.players, 'killed_now', false, 'killed', b.killed_at is not null, 'w', w);
  end if;
  if h.nickname is null then
    insert into world_boss_hits (week_start, nickname, title) values (b.week_start, nick, p_title) returning * into h;
    update world_boss set players = players + 1 where week_start = b.week_start;
  end if;
  newdmg := least(200000, round(100 * sqrt(h.kw_sum + dk * w)))::bigint;
  delta := greatest(0, newdmg - h.damage);
  update world_boss_hits set kw_sum = kw_sum + dk * w, damage = newdmg, title = coalesce(p_title, title), updated_at = now()
    where week_start = b.week_start and nickname = nick;

  if delta > 0 then
    if b.killed_at is null and b.hp_left - delta <= 0 then killed_now := true; end if;
    update world_boss set
      hp_left = greatest(0, hp_left - delta),
      dealt_total = dealt_total + delta,
      killed_at = case when killed_now then now() else killed_at end,
      last_hit_nick = case when killed_now then nick else last_hit_nick end
    where week_start = b.week_start;
    if p_alive then update world_boss_seed set last_attack_at = now() where seed = p_seed; end if;
  end if;

  if p_alive and delta > 0 then
    -- 하루 3번: 로그인했으면 계정 단위, 아니면 용사 단위
    if p_user is not null then
      insert into world_boss_user (user_id) values (p_user) on conflict (user_id) do nothing;
      select reward_day, rewards_today into r_day, r_today from world_boss_user where user_id = p_user for update;
    else
      r_day := sd.reward_day; r_today := sd.rewards_today;
    end if;
    if r_day is distinct from today then r_today := 0; end if;
    if r_today < 3 then
      cnt := least(3, greatest(1, (delta / 10000)::integer));
      for i in 1..cnt loop
        x := random();
        codes := codes || case when x < 0.0001 then 'm' when x < 0.0101 then 'l' else 'h' end;
      end loop;
      update world_boss_seed set reward_n = reward_n + 1 where seed = p_seed returning reward_n into rn;
      if p_user is not null then
        update world_boss_user set reward_day = today, rewards_today = r_today + 1 where user_id = p_user;
      else
        update world_boss_seed set reward_day = today, rewards_today = r_today + 1 where seed = p_seed;
      end if;
      rw_left := 3 - (r_today + 1);
      insert into world_boss_rewards (seed, n, codes, week_start, damage) values (p_seed, rn, codes, b.week_start, delta);
      rw := json_build_object('n', rn, 'codes', codes, 'left', rw_left);
    else
      rw_reason := 'daily_limit';
    end if;
  end if;

  select * into b from world_boss where week_start = b.week_start;
  select count(*) + 1 into rnk from world_boss_hits o where o.week_start = b.week_start and o.damage > newdmg;
  return json_build_object('boss', b.boss_name, 'hp_max', b.hp_max, 'hp_left', b.hp_left, 'delta', delta, 'damage', newdmg,
    'rank', rnk, 'players', b.players, 'killed_now', killed_now, 'killed', b.killed_at is not null, 'w', w,
    'reward', rw, 'reward_reason', rw_reason, 'next_at', case when p_alive and delta > 0 then now() + interval '1 hour' else null end);
end;
$$;

revoke all on function public.wb_apply(bigint, text, text, bigint, integer, boolean, boolean, uuid) from public, anon, authenticated;
grant execute on function public.wb_apply(bigint, text, text, bigint, integer, boolean, boolean, uuid) to service_role;
