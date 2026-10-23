-- 월드 보스: 매주 월요일 0시(한국 시간)에 다섯 세계의 마지막 지배자가 차례로 나온다.
-- 랭킹에 등록된(서버가 재생 검증한) 기록의 처치 수가 모두의 공동 보스 생명력을 깎는다.
-- 피해 = 100 × √(닉네임별 이번 주 Σ 늘어난 처치 수 × W), 닉네임당 한 주 최대 200,000.
-- W = 이번 주 보스의 출신 세계에 닿았으면 1.5, 아니면 1.
-- 쓰기는 서버(submit-run 함수)만, 읽기는 누구나.

create table if not exists public.world_boss (
  week_start    date primary key,              -- 그 주 월요일 (한국 날짜)
  boss_idx      integer not null,              -- 0 케르베로스 · 1 하데스의 섭정 · 2 칠대죄의 합일체 · 3 태초의 악 · 4 악의 근원
  boss_name     text not null,
  hp_max        bigint not null,
  hp_left       bigint not null,
  dealt_total   bigint not null default 0,     -- 생명력 0 이후에 들어온 피해도 센다 (다음 주 생명력 산정용)
  players       integer not null default 0,
  killed_at     timestamptz,
  last_hit_nick text,
  created_at    timestamptz not null default now()
);

create table if not exists public.world_boss_hits (
  week_start  date not null references public.world_boss(week_start) on delete cascade,
  nickname    text not null,
  title       text,
  kw_sum      double precision not null default 0,  -- Σ (늘어난 처치 수 × W)
  damage      bigint not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (week_start, nickname)
);
create index if not exists world_boss_hits_rank_idx on public.world_boss_hits (week_start, damage desc, updated_at asc);

-- 용사(씨앗)마다 이미 피해로 센 처치 수. 같은 용사를 다시 등록하면 늘어난 만큼만 센다 (주가 바뀌어도).
create table if not exists public.world_boss_seed (
  seed          bigint primary key,
  kills_counted bigint not null default 0,
  updated_at    timestamptz not null default now()
);

alter table public.world_boss enable row level security;
alter table public.world_boss_hits enable row level security;
alter table public.world_boss_seed enable row level security;
drop policy if exists "world boss readable" on public.world_boss;
create policy "world boss readable" on public.world_boss for select to anon, authenticated using (true);
drop policy if exists "world boss hits readable" on public.world_boss_hits;
create policy "world boss hits readable" on public.world_boss_hits for select to anon, authenticated using (true);
-- world_boss_seed는 읽기 정책도 두지 않는다 (서버 전용)

-- 이번 주 보스를 (없으면 만들어서) 돌려준다.
-- 생명력 = 지난주 총피해 × 0.9 (지난주에 못 잡았으면 × 0.7), 최소 50,000. 기록이 없는 첫 주는 200,000.
create or replace function public.wb_current()
returns public.world_boss
language plpgsql
security definer
set search_path = public
as $$
declare
  ws date := date_trunc('week', (now() at time zone 'Asia/Seoul'))::date;
  idx integer := (floor(extract(epoch from ws::timestamp) / 604800)::bigint % 5)::integer;
  names text[] := array['케르베로스','하데스의 섭정','칠대죄의 합일체','태초의 악','악의 근원'];
  prev public.world_boss;
  hp bigint;
  cur public.world_boss;
begin
  select * into cur from world_boss where week_start = ws;
  if found then return cur; end if;
  select * into prev from world_boss where week_start < ws order by week_start desc limit 1;
  if prev.week_start is null or prev.dealt_total <= 0 then
    hp := 200000;
  else
    hp := greatest(50000, round(prev.dealt_total * (case when prev.killed_at is null then 0.7 else 0.9 end))::bigint);
  end if;
  insert into world_boss (week_start, boss_idx, boss_name, hp_max, hp_left)
    values (ws, idx, names[idx + 1], hp, hp)
    on conflict (week_start) do nothing;
  select * into cur from world_boss where week_start = ws;
  return cur;
end;
$$;

-- 등록 한 건을 이번 주 보스에 반영한다. 한 트랜잭션 안에서 보스 행을 잠가 동시 등록에도 생명력과 마지막 일격이 어긋나지 않는다.
create or replace function public.wb_apply(p_seed bigint, p_nick text, p_title text, p_kills bigint, p_stage integer)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  b public.world_boss;
  w double precision;
  counted bigint;
  dk bigint;
  h public.world_boss_hits;
  newdmg bigint;
  delta bigint;
  killed_now boolean := false;
  rnk integer;
  nick text := left(btrim(coalesce(p_nick, '')), 12);
begin
  if nick = '' then return null; end if;
  perform wb_current();
  select * into b from world_boss where week_start = date_trunc('week', (now() at time zone 'Asia/Seoul'))::date for update;
  w := case when coalesce(p_stage, 0) >= b.boss_idx then 1.5 else 1 end;

  select kills_counted into counted from world_boss_seed where seed = p_seed for update;
  counted := coalesce(counted, 0);
  dk := greatest(0, coalesce(p_kills, 0) - counted);
  insert into world_boss_seed (seed, kills_counted, updated_at) values (p_seed, greatest(counted, coalesce(p_kills, 0)), now())
    on conflict (seed) do update set kills_counted = excluded.kills_counted, updated_at = now();

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
  end if;

  select * into b from world_boss where week_start = b.week_start;
  select count(*) + 1 into rnk from world_boss_hits o
    where o.week_start = b.week_start and o.damage > newdmg;
  return json_build_object('boss', b.boss_name, 'hp_max', b.hp_max, 'hp_left', b.hp_left, 'delta', delta, 'damage', newdmg,
    'rank', rnk, 'players', b.players, 'killed_now', killed_now, 'killed', b.killed_at is not null, 'w', w);
end;
$$;

revoke all on function public.wb_current() from public, anon, authenticated;
revoke all on function public.wb_apply(bigint, text, text, bigint, integer) from public, anon, authenticated;
grant execute on function public.wb_current() to service_role;
grant execute on function public.wb_apply(bigint, text, text, bigint, integer) to service_role;
