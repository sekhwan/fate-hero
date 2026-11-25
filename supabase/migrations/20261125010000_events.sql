-- 접속·플레이 분석용 가벼운 기록. 개인정보 없이 브라우저별 무작위 번호(vid)만 남긴다.
create table if not exists public.events (
  id bigserial primary key,
  ts timestamptz not null default now(),
  vid text not null check (char_length(vid) between 4 and 40),
  sid text check (char_length(sid) <= 40),
  kind text not null check (kind in ('visit','hero','go','death','clear','rank','back')),
  logged boolean not null default false,
  ver text check (char_length(ver) <= 16),
  d jsonb check (pg_column_size(d) <= 2000)
);
create index if not exists events_ts on public.events (ts);
alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
grant insert (vid, sid, kind, logged, ver, d) on public.events to anon, authenticated;
grant usage on sequence public.events_id_seq to anon, authenticated;
drop policy if exists events_insert on public.events;
create policy events_insert on public.events for insert to anon, authenticated with check (true);
