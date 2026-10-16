// 배포 직후 월드랭킹(테이블·봇·대전 로직)을 실제 DB로 점검하고, 시험 카드는 지운다.
// 필요 환경변수: SUPABASE_URL, SERVICE_KEY, ANON
import { worldRank } from '../supabase/functions/_shared/worldrank.ts';

const base = Deno.env.get('SUPABASE_URL')!;
const ANON = Deno.env.get('ANON')!;
const SERVICE = Deno.env.get('SERVICE_KEY')!;
const H = (k: string): Record<string, string> => ({ apikey: k, 'Content-Type': 'application/json', ...(k.startsWith('eyJ') ? { Authorization: 'Bearer ' + k } : {}) });
const fail = (m: string) => { throw new Error(m); };
const SEED = 9000000001;

const bots = await (await fetch(`${base}/rest/v1/pvp_cards?select=id&is_bot=eq.true`, { headers: H(ANON) })).json();
console.log('bots', Array.isArray(bots) ? bots.length : bots);
if (!Array.isArray(bots) || bots.length < 100) fail('봇 100명이 보이지 않는다');

const forged = await fetch(`${base}/rest/v1/pvp_cards`, { method: 'POST', headers: H(ANON), body: JSON.stringify({ id: 'x', nickname: 'x', hero: 'x', race: 'x' }) });
console.log('anon insert', forged.status);
if (forged.ok) fail('익명 사용자가 카드를 넣을 수 있다');

const card = { name: '시험', race: '인간', power: 40000000, hp: 6000, ass: 3, rev: 6, bls: 2, cur: 1 };
const v = (fl: number) => ({ row: { seed: SEED, nickname: '__ci__', hero: '시험' }, card, maxFloorE: fl });
try {
  const a = (await worldRank(v(12)))!;
  console.log('first', a.startRank, '→', a.rank, '/', a.total, JSON.stringify(a.rounds));
  if (!a.isNew || a.rounds.length !== 2 || a.matches.length !== 8) fail('첫 등록 대전 수가 맞지 않다');
  const b = (await worldRank(v(12)))!;
  if (b.rounds.length !== 0 || b.rank !== a.rank) fail('같은 층 재등록에서 대전이 또 일어났다');
  const c = (await worldRank(v(16)))!;
  console.log('third', c.startRank, '→', c.rank, JSON.stringify(c.rounds));
  if (c.rounds.length !== 1 || c.rounds[0].milestone !== 3) fail('새 5층 구간 대전이 맞지 않다');
  const ms = await (await fetch(`${base}/rest/v1/pvp_matches?select=id&attacker=eq.${SEED}`, { headers: H(ANON) })).json();
  if (!Array.isArray(ms) || ms.length !== 12) fail('대전 기록 수가 맞지 않다 ' + JSON.stringify(ms).slice(0, 200));
} finally {
  await fetch(`${base}/rest/v1/pvp_matches?attacker=eq.${SEED}`, { method: 'DELETE', headers: H(SERVICE) });
  const d = await fetch(`${base}/rest/v1/pvp_cards?id=eq.${SEED}`, { method: 'DELETE', headers: H(SERVICE) });
  console.log('cleanup', d.status);
}
console.log('WORLD E2E OK');
