-- 용사 연대기 업적 칭호: 랭킹에서 닉네임 옆에 보여 준다
alter table public.runs add column if not exists title text;
alter table public.pvp_cards add column if not exists title text;
