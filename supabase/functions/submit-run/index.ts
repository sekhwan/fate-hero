// 플레이 기록을 처음부터 다시 재생해 검증한 뒤 랭킹에 올린다.
import { LIMITS, verifySubmission } from '../_shared/verify.js';
import { adminHeaders, cors, json, restUrl, runSecret } from '../_shared/http.ts';
import { worldRank } from '../_shared/worldrank.ts';

// 요청의 Authorization이 로그인한 사람의 토큰이면 그 사람의 id (공개 키나 없음이면 null)
async function userFromRequest(req: Request): Promise<string | null> {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get('authorization') ?? '');
  if (!m) return null;
  const tok = m[1];
  try {
    const seg = (tok.split('.')[1] ?? '').replace(/-/g, '+').replace(/_/g, '/');
    const p = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(seg.padEnd(Math.ceil(seg.length / 4) * 4, '=')), (c) => c.charCodeAt(0))));
    if (!p || p.role !== 'authenticated' || !p.sub) return null;
  } catch { return null; }
  const base = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
  const r = await fetch(`${base}/auth/v1/user`, { headers: { apikey: adminHeaders().apikey, Authorization: `Bearer ${tok}` } });
  if (!r.ok) return null;
  const u = await r.json();
  return u && u.id ? String(u.id) : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST만 받는다' }, 405);

  let body: unknown;
  try {
    const text = await req.text();
    if (text.length > LIMITS.maxBodyBytes) return json({ error: '기록이 너무 크다' }, 413);
    body = JSON.parse(text);
  } catch {
    return json({ error: '잘못된 요청' }, 400);
  }

  let verified;
  try {
    verified = await verifySubmission(body, runSecret());
  } catch (e) {
    const msg = (e as Error).message;
    // 재생이 어긋난 기록은 원인을 찾을 수 있게 보관한다 (게임 기록뿐, 개인정보 없음)
    if (msg.startsWith('기록 재생 실패') || msg.startsWith('게임 버전이')) {
      try {
        const b = body as Record<string, unknown>;
        await fetch(restUrl('run_failures'), {
          method: 'POST',
          headers: { ...adminHeaders(), Prefer: 'return=minimal' },
          body: JSON.stringify({ seed: Number(b?.seed) || null, version: String(b?.version ?? ''), error: msg, log: { nickname: b?.nickname ?? null, ts: b?.ts ?? null, token: b?.token ?? null, log: b?.log ?? null } }),
        });
      } catch (err) { console.error('failure log', err); }
    }
    return json({ error: msg }, 400);
  }

  // 월드 보스 보상 기록(W)은 서버가 실제로 지급한 것과 번호·등급이 모두 같아야 한다
  if (verified.wbActs && verified.wbActs.length) {
    try {
      const rr = await fetch(restUrl(`world_boss_rewards?seed=eq.${verified.row.seed}&select=n,codes`), { headers: adminHeaders() });
      const issued = new Set(((rr.ok ? await rr.json() : []) as { n: number; codes: string }[]).map((x) => `${x.n}:${x.codes}`));
      const seen = new Set();
      for (const w of verified.wbActs) {
        if (!issued.has(w) || seen.has(w)) return json({ error: '월드 보스 보상 기록이 서버 기록과 다르다' }, 400);
        seen.add(w);
      }
    } catch (e) { console.error('reward check', e); return json({ error: '서버 오류' }, 500); }
  }

  // 가문 족보: 로그인한 사람의 끝난 판을 족보에 올린다 (같은 판은 한 번만)
  let userId: string | null = null;
  try { userId = await userFromRequest(req); } catch (e) { console.error('user', e); }
  const addMember = async () => {
    if (!userId || verified.alive) return null;
    const r = verified.row;
    const res = await fetch(restUrl('rpc/house_add_member'), { method: 'POST', headers: adminHeaders(),
      body: JSON.stringify({ p_owner: userId, p_seed: r.seed, p_hero: r.hero, p_race: r.race, p_reach: r.reach, p_score: r.reach_score, p_kills: r.kills, p_power: r.power, p_alive: false }) });
    return res.ok ? await res.json() : null;
  };
  // 가문 유산: 기록에 적힌 유산 단계가 그 계정이 산 단계를 넘으면 안 된다
  {
    const m = /^v([0-3])a([0-2])b([0-2])t([0-2])n([01])$/.exec(verified.legacy || '');
    const want = m ? { vault: +m[1], arms: +m[2], bless: +m[3], train: +m[4], name: +m[5] } : null;
    const sum = want ? Object.values(want).reduce((a, b) => a + b, 0) : 0;
    if (verified.legacy && !want) return json({ error: '유산 기록 형식이 맞지 않는다' }, 400);
    if (sum > 0) {
      if (!userId) return json({ error: '유산은 로그인한 가문만 쓸 수 있다' }, 400);
      const hr = await fetch(restUrl(`houses?owner=eq.${userId}&select=legacy`), { headers: adminHeaders() });
      const own = hr.ok ? ((await hr.json())[0]?.legacy ?? {}) : {};
      for (const [k, v] of Object.entries(want!)) if (v > (Number(own[k]) || 0)) return json({ error: '가문이 가진 유산보다 높은 유산 기록이다' }, 400);
    }
    (verified.row as Record<string, unknown>).legacy_lv = sum;
  }

  // 족보 보고만 하는 요청 (랭킹·월드 보스에는 올리지 않는다)
  if ((body as Record<string, unknown>)?.report_only === true) {
    if (!userId) return json({ error: '로그인이 필요하다' }, 401);
    try { return json({ ok: true, house: await addMember() }); } catch (e) { console.error('report', e); return json({ error: '서버 오류' }, 500); }
  }

  // 계정: 로그인했으면 그 사람의 닉네임으로 등록한다. 가입한 다른 사람의 닉네임은 쓸 수 없다.
  try {
    const ownerRes = await fetch(restUrl('rpc/nick_owner'), { method: 'POST', headers: adminHeaders(), body: JSON.stringify({ p_nick: verified.row.nickname }) });
    const owner = ownerRes.ok ? await ownerRes.json() : null;
    if (userId) {
      const pr = await fetch(restUrl(`profiles?id=eq.${userId}&select=nickname`), { headers: adminHeaders() });
      const prof = pr.ok ? (await pr.json())[0] : null;
      if (prof && prof.nickname) verified.row.nickname = prof.nickname;
      else if (owner && owner !== userId) return json({ error: '이 닉네임은 가입한 다른 사람의 것이다. 다른 닉네임을 써 주세요.' }, 400);
      else {
        await fetch(restUrl('profiles?on_conflict=id'), { method: 'POST', headers: { ...adminHeaders(), Prefer: 'resolution=merge-duplicates,return=minimal' },
          body: JSON.stringify({ id: userId, nickname: verified.row.nickname, updated_at: new Date().toISOString() }) });
      }
      (verified.row as Record<string, unknown>).user_id = userId;
    } else if (owner) {
      return json({ error: '이 닉네임은 가입한 사람의 것이다. 그 계정으로 로그인하거나 다른 닉네임을 써 주세요.' }, 400);
    }
  } catch (e) { console.error('account', e); }

  // 월드 보스 칭호: 그 닉네임이 실제로 받은 칭호일 때만 붙인다
  if (!verified.row.title && verified.rawTitle) {
    try {
      const q = `world_boss_titles?nickname=eq.${encodeURIComponent(verified.row.nickname)}&title=eq.${encodeURIComponent(verified.rawTitle)}&select=title&limit=1`;
      const tr = await fetch(restUrl(q), { headers: adminHeaders() });
      const rows = tr.ok ? await tr.json() : [];
      if (Array.isArray(rows) && rows.length) verified.row.title = verified.rawTitle;
    } catch (e) { console.error('title check', e); }
  }

  try {
    const up = await fetch(restUrl('runs?on_conflict=seed'), {
      method: 'POST',
      headers: { ...adminHeaders(), Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify(verified.row),
    });
    if (!up.ok) {
      console.error('upsert', up.status, await up.text());
      return json({ error: '저장 실패' }, 500);
    }
    const rk = await fetch(restUrl('rpc/run_ranks'), {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ p_seed: verified.row.seed }),
    });
    const ranks = rk.ok ? await rk.json() : null;
    let world = null;
    try { world = await worldRank(verified); } catch (e) { console.error('world', e); }
    // 월드 보스: 실패해도 랭킹 등록은 성공으로 둔다
    let boss = null;
    try {
      const row = verified.row;
      const wb = await fetch(restUrl('rpc/wb_apply'), {
        method: 'POST',
        headers: adminHeaders(),
        body: JSON.stringify({ p_seed: row.seed, p_nick: row.nickname, p_title: row.title, p_kills: row.kills, p_stage: Math.min(5, Math.floor((row.reach_score || 0) / 1000)), p_attack: (body as Record<string, unknown>)?.attack === true, p_alive: !!verified.alive, p_user: userId }),
      });
      if (wb.ok) boss = await wb.json(); else console.error('world boss', wb.status, await wb.text());
    } catch (e) { console.error('world boss', e); }
    let house = null;
    try { house = await addMember(); } catch (e) { console.error('house', e); }
    return json({ ok: true, summary: verified.summary, ranks, world, boss, house });
  } catch (e) {
    console.error(e);
    return json({ error: '서버 오류' }, 500);
  }
});
