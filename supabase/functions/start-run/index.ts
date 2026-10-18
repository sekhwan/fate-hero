// 새 용사의 seed를 서버가 정하고 서명해서 돌려준다.
import { issueBatch, issueRun } from '../_shared/verify.js';
import { cors, json, runSecret } from '../_shared/http.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST만 받는다' }, 405);
  try {
    let wantBatch = false;
    try { const b = await req.json(); wantBatch = !!(b && b.batch); } catch { /* 빈 본문 */ }
    return json(wantBatch ? await issueBatch(runSecret()) : await issueRun(runSecret()));
  } catch (e) {
    console.error(e);
    return json({ error: '서버 설정 오류' }, 500);
  }
});
