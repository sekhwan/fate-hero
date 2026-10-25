-- 가문 깃발 그림 빼기가 안 되던 문제: 'keepUrl' 표시가 문장 정보에 저장돼 남아 있어서 그림이 계속 유지됐다.
-- 저장할 때 그 표시는 빼고, 이미 저장된 것도 지운다.
update public.houses set crest = crest - 'keepUrl' where crest ? 'keepUrl';

-- 가문 세우기 / 고치기: 가문이 없으면 새로 세워 가주가 되고, 있으면 가주만 고칠 수 있다
create or replace function public.save_house(p_name text, p_crest jsonb, p_crest_url text, p_color1 text, p_color2 text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  nm text := left(btrim(regexp_replace(coalesce(p_name, ''), '[[:cntrl:]<>]', '', 'g')), 12);
  other bigint;
  u house_users;
  h public.houses;
  c1 text := case when p_color1 ~ '^#[0-9a-fA-F]{6}$' then p_color1 else '#b8862b' end;
  c2 text := case when p_color2 ~ '^#[0-9a-fA-F]{6}$' then p_color2 else '#3a1a1a' end;
  url text := case when p_crest_url like '%/storage/v1/object/public/crests/' || auth.uid()::text || '%' then p_crest_url else null end;
begin
  if auth.uid() is null then return json_build_object('ok', false, 'error', '가입이 필요하다'); end if;
  if char_length(nm) < 2 then return json_build_object('ok', false, 'error', '가문 이름은 2~12자다'); end if;
  select * into u from house_users where user_id = auth.uid();
  if u.house_id is not null and u.role <> 'leader' then return json_build_object('ok', false, 'error', '가주만 가문을 고칠 수 있다'); end if;
  select id into other from houses where lower(name) = lower(nm) and id is distinct from u.house_id;
  if other is not null then return json_build_object('ok', false, 'error', '이미 있는 가문 이름이다'); end if;
  if u.house_id is null then
    insert into houses (owner, name, crest, crest_url, color1, color2)
      values (auth.uid(), nm, coalesce(p_crest, '{}'::jsonb) - 'keepUrl', url, c1, c2) returning * into h;
    insert into house_users (user_id, house_id, role) values (auth.uid(), h.id, 'leader');
    delete from house_apps where user_id = auth.uid();
  else
    update houses set name = nm, crest = coalesce(p_crest, '{}'::jsonb) - 'keepUrl',
      crest_url = coalesce(url, case when p_crest ? 'keepUrl' then crest_url else null end),
      crest_hidden = case when url is not null then false else crest_hidden end,
      color1 = c1, color2 = c2
    where id = u.house_id returning * into h;
  end if;
  return json_build_object('ok', true, 'id', h.id, 'name', h.name);
end;
$$;

