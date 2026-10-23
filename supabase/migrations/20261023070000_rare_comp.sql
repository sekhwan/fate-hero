-- 희귀 동료와 함께한 판 표시 (랭킹에서 이름 옆에 보여 준다). 서버가 기록을 재생해 채운다.
alter table public.runs add column if not exists rare_comp text not null default '';
