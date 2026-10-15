-- 재생 검증에 실패한 등록 기록을 원인 분석용으로 보관한다. 공개 접근 없음(서버 함수만 쓴다).
create table if not exists public.run_failures (
  id          bigserial primary key,
  seed        bigint,
  version     text,
  error       text,
  log         jsonb,
  created_at  timestamptz not null default now()
);
alter table public.run_failures enable row level security;
revoke all on public.run_failures from anon, authenticated;
