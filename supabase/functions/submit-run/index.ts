// 플레이 기록을 처음부터 다시 재생해 검증한 뒤 랭킹에 올린다.
import { LIMITS, verifySubmission } from '../_shared/verify.js';
import { adminHeaders, cors, json, restUrl, runSecret } from '../_shared/http.ts';

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
    return json({ error: (e as Error).message }, 400);
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
    return json({ ok: true, summary: verified.summary, ranks });
  } catch (e) {
    console.error(e);
    return json({ error: '서버 오류' }, 500);
  }
});
