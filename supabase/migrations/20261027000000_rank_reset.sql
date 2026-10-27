-- 2026-10-27 랭킹 전체 초기화 (계정·가문·유산은 유지).
-- 지우기 전에 bak_20261027 스키마에 그대로 복사해 둔다 (되살릴 때 쓰기).
create schema if not exists bak_20261027;
revoke all on schema bak_20261027 from public, anon, authenticated;
do $$
declare t text;
begin
  foreach t in array array['runs','run_failures','pvp_cards','pvp_matches','world_boss','world_boss_hits','world_boss_seed','world_boss_rewards','world_boss_titles','world_boss_user','house_week'] loop
    execute format('drop table if exists bak_20261027.%I', t);
    execute format('create table bak_20261027.%I as table public.%I', t, t);
  end loop;
end $$;

delete from public.runs;
delete from public.run_failures;
delete from public.pvp_matches;
delete from public.pvp_cards where not is_bot;
update public.pvp_cards set fights_done = 0,
  ladder = 1000 + 200 * log(greatest(1::double precision, power(greatest(1, power)::double precision, 0.7) * power(greatest(1, hp)::double precision, 0.3)) / 1e6)
  where is_bot;
delete from public.world_boss_hits;
delete from public.world_boss_seed;
delete from public.world_boss_rewards;
delete from public.world_boss_titles;
delete from public.world_boss_user;
update public.world_boss set hp_left = hp_max, dealt_total = 0, players = 0, killed_at = null, last_hit_nick = null
  where week_start = (select max(week_start) from public.world_boss);
delete from public.house_week;
