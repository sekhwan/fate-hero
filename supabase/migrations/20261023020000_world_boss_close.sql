-- 월드 보스 주간 마감: 지난주 보스를 마감하고 칭호를 나눠 준다.
-- 매주 월요일 0시 1분(한국 시간)에 GitHub Actions(wb-close)가 wb_close()를 부르고,
-- 그 전에 누군가 등록하면 wb_current()가 먼저 마감한다 (둘 다 같은 함수라 두 번 지급되지 않는다).
--   참여(피해 1 이상)         「토벌대원」
--   처치한 주의 참여자 전원   「<보스 이름> 토벌자」
--   기여 상위 10% (최소 1명)  「선봉장」
--   마지막 일격               「최후의 일격」
--   주간 1위                  「토벌대장」
-- 칭호는 닉네임에 붙는다. 랭킹 등록 때 대표 칭호로 보내면 서버가 이 표로 확인한다.

alter table public.world_boss add column if not exists closed_at timestamptz;

create table if not exists public.world_boss_titles (
  nickname   text not null,
  title      text not null,
  week_start date not null,
  boss_name  text,
  created_at timestamptz not null default now(),
  primary key (nickname, title, week_start)
);
create index if not exists world_boss_titles_nick_idx on public.world_boss_titles (nickname);
alter table public.world_boss_titles enable row level security;
drop policy if exists "world boss titles readable" on public.world_boss_titles;
create policy "world boss titles readable" on public.world_boss_titles for select to anon, authenticated using (true);

create or replace function public.wb_close()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  ws date := date_trunc('week', (now() at time zone 'Asia/Seoul'))::date;
  b public.world_boss;
  n integer := 0;
  topn integer;
begin
  for b in select * from world_boss where week_start < ws and closed_at is null order by week_start for update loop
    insert into world_boss_titles (nickname, title, week_start, boss_name)
      select nickname, '토벌대원', b.week_start, b.boss_name from world_boss_hits where week_start = b.week_start and damage > 0
      on conflict do nothing;
    if b.killed_at is not null then
      insert into world_boss_titles (nickname, title, week_start, boss_name)
        select nickname, b.boss_name || ' 토벌자', b.week_start, b.boss_name from world_boss_hits where week_start = b.week_start and damage > 0
        on conflict do nothing;
      if b.last_hit_nick is not null then
        insert into world_boss_titles (nickname, title, week_start, boss_name) values (b.last_hit_nick, '최후의 일격', b.week_start, b.boss_name)
          on conflict do nothing;
      end if;
    end if;
    select greatest(1, ceil(count(*) * 0.1))::integer into topn from world_boss_hits where week_start = b.week_start and damage > 0;
    insert into world_boss_titles (nickname, title, week_start, boss_name)
      select nickname, '선봉장', b.week_start, b.boss_name from (
        select nickname from world_boss_hits where week_start = b.week_start and damage > 0 order by damage desc, updated_at asc limit topn) t
      on conflict do nothing;
    insert into world_boss_titles (nickname, title, week_start, boss_name)
      select nickname, '토벌대장', b.week_start, b.boss_name from world_boss_hits where week_start = b.week_start and damage > 0
        order by damage desc, updated_at asc limit 1
      on conflict do nothing;
    update world_boss set closed_at = now() where week_start = b.week_start;
    n := n + 1;
  end loop;
  return n;
end;
$$;

-- 이번 주 보스를 돌려주기 전에 지난주들을 먼저 마감한다
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
  perform wb_close();
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

revoke all on function public.wb_close() from public, anon, authenticated;
grant execute on function public.wb_close() to service_role;
