-- 가문 랭킹 (가문 점수가 생기기 전까지는 가장 멀리 간 조상·족보 인원으로 줄 세운다)
create or replace view public.house_rank with (security_invoker = true) as
select h.id, h.name, h.crest, h.crest_url, h.crest_hidden, h.color1, h.color2, h.score, h.unnamed,
  count(m.seed)::int as members,
  coalesce(max(m.reach_score), 0) as best_score,
  (array_agg(m.hero order by m.reach_score desc))[1] as best_hero,
  (array_agg(m.reach order by m.reach_score desc))[1] as best_reach
from public.houses h
left join public.house_members m on m.house_id = h.id
group by h.id;

grant select on public.house_rank to anon, authenticated;
