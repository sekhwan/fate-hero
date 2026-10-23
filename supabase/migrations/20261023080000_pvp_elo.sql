-- 월드랭킹을 점수제(Elo)로 바꾼다.
-- 지금까지의 자리 값(ladder)은 버리고, 모든 카드(봇 포함)를 체급으로 정한 시작 점수에서 다시 출발시킨다.
--   시작 점수 = 1000 + 200 × log10(체급 / 100만),  체급 = 전투력^0.7 × 최대 생명력^0.3
-- 이후 점수는 대전마다 공격한 쪽과 방어한 쪽이 함께 오르내린다 (submit-run이 계산해서 pvp_apply로 더한다).
alter table public.pvp_cards add column if not exists r0 double precision;

update public.pvp_cards set
  r0 = 1000 + 200 * log(greatest(1::double precision, power(greatest(1, power)::double precision, 0.7) * power(greatest(1, hp)::double precision, 0.3)) / 1e6),
  ladder = 1000 + 200 * log(greatest(1::double precision, power(greatest(1, power)::double precision, 0.7) * power(greatest(1, hp)::double precision, 0.3)) / 1e6);

create or replace function public.pvp_apply(p jsonb)
returns void
language sql
security definer
set search_path = public
as $$
  update pvp_cards c set ladder = c.ladder + (x ->> 'd')::double precision
  from jsonb_array_elements(coalesce(p, '[]'::jsonb)) x
  where c.id = x ->> 'id';
$$;
revoke all on function public.pvp_apply(jsonb) from public, anon, authenticated;
grant execute on function public.pvp_apply(jsonb) to service_role;
