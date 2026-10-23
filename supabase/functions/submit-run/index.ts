// 플레이 기록을 처음부터 다시 재생해 검증한 뒤 랭킹에 올린다.
import { LIMITS, verifySubmission } from '../_shared/verify.js';
import { adminHeaders, cors, json, restUrl, runSecret } from '../_shared/http.ts';
import { worldRank } from '../_shared/worldrank.ts';

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
        body: JSON.stringify({ p_seed: row.seed, p_nick: row.nickname, p_title: row.title, p_kills: row.kills, p_stage: Math.min(5, Math.floor((row.reach_score || 0) / 1000)), p_attack: (body as Record<string, unknown>)?.attack === true, p_alive: !!verified.alive }),
      });
      if (wb.ok) boss = await wb.json(); else console.error('world boss', wb.status, await wb.text());
    } catch (e) { console.error('world boss', e); }
    return json({ ok: true, summary: verified.summary, ranks, world, boss });
  } catch (e) {
    console.error(e);
    return json({ error: '서버 오류' }, 500);
  }
});
