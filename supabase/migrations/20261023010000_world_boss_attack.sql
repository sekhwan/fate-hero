-- 월드 보스 공격 제한과 보상
-- 공격: 살아 있는 용사가 '공격하기'로 등록할 때만 피해가 들어가고, 용사 한 명당 1시간에 한 번.
--       죽은(끝난) 용사의 마지막 등록은 제한 없이 피해가 들어간다. 그 밖의 등록은 랭킹만 갱신하고 처치 수는 다음 공격으로 넘어간다.
-- 보상: 살아 있는 용사의 공격에만, 용사 한 명당 하루(한국 날짜) 3번까지.
--       피해 10,000마다 1개(최소 1, 최대 3), 하나마다 영웅 99% · +7 전설 1% · 신화 0.01%.
--       등급 코드(h·l·m)를 world_boss_rewards에 남기고, 게임 기록의 W 행동이 이것과 같아야 랭킹 검증을 통과한다.

alter table public.world_boss_seed add column if not exists last_attack_at timestamptz;
alter table public.world_boss_seed add column if not exists reward_day date;
alter table public.world_boss_seed add column if not exists rewards_today integer not null default 0;
alter table public.world_boss_seed add column if not exists reward_n integer not null default 0;

create table if not exists public.world_boss_rewards (
  seed       bigint not null,
  n          integer not null,
  codes      text not null check (codes ~ '^[hlm]{1,3}$'),
  week_start date,
  damage     bigint,
  created_at timestamptz not null default now(),
  primary key (seed, n)
);
alter table public.world_boss_rewards enable row level security;
-- 읽기 정책 없음 (서버 전용)

drop function if exists public.wb_apply(bigint, text, text, bigint, integer);

create or replace function public.wb_apply(p_seed bigint, p_nick text, p_title text, p_kills bigint, p_stage integer, p_attack boolean, p_alive boolean)
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
begin
  if nick = '' then return null; end if;
  perform wb_current();
  select * into b from world_boss where week_start = date_trunc('week', (now() at time zone 'Asia/Seoul'))::date for update;
  w := case when coalesce(p_stage, 0) >= b.boss_idx then 1.5 else 1 end;

  insert into world_boss_seed (seed) values (p_seed) on conflict (seed) do nothing;
  select * into sd from world_boss_seed where seed = p_seed for update;

  -- 피해를 넣을 수 있는가
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

  -- 보상 (살아 있는 용사의 공격, 피해가 들어갔을 때, 하루 3번까지)
  if p_alive and delta > 0 then
    if sd.reward_day is distinct from today then
      update world_boss_seed set reward_day = today, rewards_today = 0 where seed = p_seed;
      sd.rewards_today := 0;
    end if;
    if sd.rewards_today < 3 then
      cnt := least(3, greatest(1, (delta / 10000)::integer));
      for i in 1..cnt loop
        x := random();
        codes := codes || case when x < 0.0001 then 'm' when x < 0.0101 then 'l' else 'h' end;
      end loop;
      update world_boss_seed set reward_n = reward_n + 1, rewards_today = rewards_today + 1 where seed = p_seed
        returning reward_n, 3 - rewards_today into sd.reward_n, rw_left;
      insert into world_boss_rewards (seed, n, codes, week_start, damage) values (p_seed, sd.reward_n, codes, b.week_start, delta);
      rw := json_build_object('n', sd.reward_n, 'codes', codes, 'left', rw_left);
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

revoke all on function public.wb_apply(bigint, text, text, bigint, integer, boolean, boolean) from public, anon, authenticated;
grant execute on function public.wb_apply(bigint, text, text, bigint, integer, boolean, boolean) to service_role;
