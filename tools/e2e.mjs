// 배포 직후 실제 서버로 한 판을 끝까지 돌려 랭킹 등록이 되는지 확인하고, 시험 기록은 지운다.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const E = require('../public/engine.js');
const { REF, ANON, SERVICE } = process.env;
const base = `https://${REF}.supabase.co`;
const H = (k) => ({ apikey: k, 'Content-Type': 'application/json', ...(k.startsWith('eyJ') ? { Authorization: 'Bearer ' + k } : {}) });
const st = await (await fetch(`${base}/functions/v1/start-run`, { method: 'POST', headers: H(ANON), body: '{}' })).json();
if (!st.token) throw new Error('start-run 실패 ' + JSON.stringify(st));
const s = E.newRun(E.makeHero(st.seed), 0, E.mixSeed(st.seed, 1)); const log = [['start', st.seed, 0]];
let g = 0; while (g++ < 5000 && !s.dead && !s.over) { const c = E.current(s); const o = E.autoChoice(s, c); E.choose(s, o); log.push(['c', o]); }
const live = E.runSummary(s);
const r = await fetch(`${base}/functions/v1/submit-run`, { method: 'POST', headers: H(ANON), body: JSON.stringify({ version: E.ENGINE_VERSION, seed: st.seed, token: st.token, ts: st.ts, nickname: '__ci__', log }) });
const j = await r.json();
console.log('submit', r.status, JSON.stringify(j));
if (!j.ok || j.summary.kills !== live.kills || j.summary.power !== live.power) throw new Error('등록 결과 불일치');
const forged = await fetch(`${base}/functions/v1/submit-run`, { method: 'POST', headers: H(ANON), body: JSON.stringify({ version: E.ENGINE_VERSION, seed: st.seed, token: 'x', ts: st.ts, nickname: 'x', log }) });
if (forged.status !== 400) throw new Error('위조 기록이 통과했다');
const read = await fetch(`${base}/rest/v1/runs?select=seed,nickname,kills&seed=eq.${st.seed}`, { headers: H(ANON) });
const rows = await read.json(); console.log('public read', JSON.stringify(rows));
if (!Array.isArray(rows) || rows.length !== 1) throw new Error('공개 읽기 실패');
const w = await fetch(`${base}/rest/v1/runs?seed=eq.${st.seed}`, { method: 'DELETE', headers: H(ANON) });
const still = await (await fetch(`${base}/rest/v1/runs?select=seed&seed=eq.${st.seed}`, { headers: H(ANON) })).json();
if (still.length !== 1) throw new Error('익명 사용자가 기록을 지울 수 있다');
const d = await fetch(`${base}/rest/v1/runs?seed=eq.${st.seed}`, { method: 'DELETE', headers: H(SERVICE) });
console.log('cleanup', d.status, 'anon delete blocked:', w.status);
// 주사위 묶음 발급 → 묶음의 3번째 후보로 한 판 → 등록 검증 → 정리
{
  const bt = await (await fetch(`${base}/functions/v1/start-run`, { method: 'POST', headers: H(ANON), body: '{"batch":1}' })).json();
  if (!bt.batch || !bt.token) throw new Error('묶음 발급 실패 ' + JSON.stringify(bt));
  const i = 2, seed = E.mixSeed(bt.base, i) >>> 0;
  const s2 = E.newRun(E.makeHero(seed), 0, E.mixSeed(seed, 1)); const log2 = [['start', seed, 0]];
  let g2 = 0; while (g2++ < 5000 && !s2.dead && !s2.over) { const c = E.current(s2); const o = E.autoChoice(s2, c); E.choose(s2, o); log2.push(['c', o]); }
  const rb = await fetch(`${base}/functions/v1/submit-run`, { method: 'POST', headers: H(ANON), body: JSON.stringify({ version: E.ENGINE_VERSION, seed, token: bt.token, ts: bt.ts, nickname: '__ci__', log: log2, batch: { base: bt.base, i, n: bt.n } }) });
  const jb = await rb.json(); console.log('batch submit', rb.status, jb.ok);
  await fetch(`${base}/rest/v1/runs?seed=eq.${seed}`, { method: 'DELETE', headers: H(SERVICE) });
  if (!jb.ok) throw new Error('묶음 등록 실패 ' + JSON.stringify(jb));
  const bad = await fetch(`${base}/functions/v1/submit-run`, { method: 'POST', headers: H(ANON), body: JSON.stringify({ version: E.ENGINE_VERSION, seed, token: bt.token, ts: bt.ts, nickname: 'x', log: log2, batch: { base: bt.base, i: 3, n: bt.n } }) });
  if (bad.status !== 400) throw new Error('묶음 번호 위조가 통과했다');
}
console.log('E2E OK');
