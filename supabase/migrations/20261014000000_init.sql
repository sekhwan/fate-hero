-- 운명의 용사 랭킹 테이블
-- 용사 한 명(서버가 발급한 seed) = 한 줄. 같은 용사를 다시 등록하면 마지막 기록으로 갱신된다.
-- 쓰기는 서버(submit-run 함수, service role 키)만 할 수 있고, 누구나 읽기만 할 수 있다.

create table if not exists public.runs (
  seed         bigint primary key,
  nickname     text not null check (char_length(nickname) between 1 and 12),
  hero         text not null,
  race         text not null,
  kills        bigint not null default 0,
  power        bigint not null default 0,
  reach        text not null,
  reach_score  double precision not null default 0,
  actions      integer not null default 0,
  version      text not null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists runs_kills_idx on public.runs (kills desc, updated_at asc);
create index if not exists runs_power_idx on public.runs (power desc, updated_at asc);
create index if not exists runs_reach_idx on public.runs (reach_score desc, updated_at asc);

alter table public.runs enable row level security;

drop policy if exists "runs are readable by everyone" on public.runs;
create policy "runs are readable by everyone"
  on public.runs for select
  to anon, authenticated
  using (true);
-- insert/update/delete 정책은 일부러 만들지 않는다. (service role은 RLS를 우회한다)

-- 등록 직후 세 가지 순위를 한 번에 계산한다. submit-run 함수만 호출한다.
create or replace function public.run_ranks(p_seed bigint)
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'kills', (select count(*) + 1 from runs o where o.kills > r.kills
                or (o.kills = r.kills and o.updated_at < r.updated_at)),
    'power', (select count(*) + 1 from runs o where o.power > r.power
                or (o.power = r.power and o.updated_at < r.updated_at)),
    'reach', (select count(*) + 1 from runs o where o.reach_score > r.reach_score
                or (o.reach_score = r.reach_score and o.updated_at < r.updated_at)),
    'total', (select count(*) from runs)
  )
  from runs r where r.seed = p_seed;
$$;

revoke all on function public.run_ranks(bigint) from public, anon, authenticated;
grant execute on function public.run_ranks(bigint) to service_role;
