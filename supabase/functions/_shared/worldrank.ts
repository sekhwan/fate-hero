// 월드랭킹 카드 저장과 대전 처리 (submit-run과 CI 점검이 함께 쓴다)
import { adminHeaders, restUrl } from './http.ts';
import './engine.js';
import { planWorld } from './world.js';

// deno-lint-ignore no-explicit-any
const E = (globalThis as any).FateEngine;

// 끝없는 전장에 들어선 용사는 월드랭킹 카드를 올리고, 새로 넘은 5층마다 대전을 치른다.
// deno-lint-ignore no-explicit-any
export async function worldRank(v: any) {
  const c = v.card;
  if (!c || !(v.maxFloorE >= 1)) return null;
  const id = String(v.row.seed);
  const H = adminHeaders();
  const sel = 'id,nickname,race,power,hp,ass,rev,bls,cur,ladder,is_bot,fights_done';
  const [mineR, othersR] = await Promise.all([
    fetch(restUrl(`pvp_cards?id=eq.${id}&select=${sel}`), { headers: H }),
    fetch(restUrl(`pvp_cards?id=neq.${id}&select=${sel}&order=ladder.desc&limit=5000`), { headers: H }),
  ]);
  if (!mineR.ok || !othersR.ok) throw new Error('pvp read ' + mineR.status + '/' + othersR.status);
  const prev = (await mineR.json())[0];
  const others = await othersR.json();
  const int = (x: unknown, hi: number) => Math.max(0, Math.min(hi, Math.floor(Number(x) || 0)));
  const me = {
    id, nickname: v.row.nickname, race: String(c.race).slice(0, 20),
    power: int(c.power, 9e15), hp: int(c.hp, 9e12) || 100,
    ass: int(c.ass, 9999), rev: int(c.rev, 9999), bls: int(c.bls, 9999), cur: int(c.cur, 9999),
    floor: int(v.maxFloorE, 1e7), fights_done: prev ? prev.fights_done : 0, ladder: prev ? prev.ladder : null,
  };
  const plan = planWorld(E, me, others, v.row.seed);
  const { ladder: _l, fights_done: _f, ...base } = me;
  const up = await fetch(restUrl('pvp_cards?on_conflict=id'), {
    method: 'POST',
    headers: { ...H, Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ ...base, seed: v.row.seed, hero: v.row.hero, ladder: plan.ladder, fights_done: plan.fightsDone, is_bot: false, updated_at: new Date().toISOString() }),
  });
  if (!up.ok) throw new Error('pvp upsert ' + up.status + ' ' + (await up.text()));
  if (plan.matches.length) {
    const ins = await fetch(restUrl('pvp_matches'), {
      method: 'POST',
      headers: { ...H, Prefer: 'return=minimal' },
      // deno-lint-ignore no-explicit-any
      body: JSON.stringify(plan.matches.map((m: any) => ({ attacker: id, defender: m.defender, milestone: m.milestone, win: m.win, p: m.p, log: { how: m.how, log: m.log, opp: m.opp, oppRank: m.oppRank } }))),
    });
    if (!ins.ok) console.error('pvp matches', ins.status, await ins.text());
  }
  return { rank: plan.rank, startRank: plan.startRank, total: plan.total, rounds: plan.rounds, matches: plan.matches, isNew: !prev };
}

