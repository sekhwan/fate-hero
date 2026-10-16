// 월드랭킹 대전 계산. 순수 함수라서 브라우저 없이도 시험할 수 있다.
// 규칙: 끝없는 전장 5층마다 한 번, 앞뒤 10위 안의 상대 4명과 붙는다.
// 순위 변동 = round(2.5 × (승 − 패)). 방어하는 쪽 순위는 변하지 않는다.
export const WORLD = { per: 5, duels: 4, window: 10, maxMilestones: 20, step: 2.5 };

const KEYS = ['ass', 'rev', 'bls', 'cur'];
export function fighter(c) {
  const o = { name: c.nickname, race: c.race, power: Number(c.power) || 0, hp: Number(c.hp) || 100 };
  for (const k of KEYS) o[k] = Number(c[k]) || 0;
  return o;
}

function ladderAt(list, i) {
  if (!list.length) return 0;
  if (i <= 0) return list[0].ladder + 10;
  if (i >= list.length) return list[list.length - 1].ladder - 10;
  return (list[i - 1].ladder + list[i].ladder) / 2;
}

// me: 이번에 올린 카드(+이전 ladder/fights_done), others: 나머지 카드(ladder 내림차순)
export function planWorld(E, me, others, seed) {
  const list = others.slice().sort((a, b) => b.ladder - a.ladder);
  const A = fighter(me);
  let idx;
  if (me.ladder == null) {
    const mine = E.pvpMight ? E.pvpMight(A) : A.power;
    idx = list.filter((c) => (E.pvpMight ? E.pvpMight(fighter(c)) : Number(c.power)) > mine).length;
  } else {
    idx = list.filter((c) => c.ladder > me.ladder).length;
  }
  const startRank = idx + 1;
  const done = me.fights_done || 0;
  const target = Math.floor((me.floor || 0) / WORLD.per);
  const last = Math.min(target, done + WORLD.maxMilestones);
  const matches = [];
  const rounds = [];
  for (let m = done + 1; m <= last; m++) {
    const r = E.rng(E.mixSeed(seed >>> 0, m));
    const lo = Math.max(0, idx - WORLD.window), hi = Math.min(list.length - 1, idx + WORLD.window - 1);
    const pool = [];
    for (let i = lo; i <= hi; i++) pool.push(i);
    const pick = [];
    while (pick.length < WORLD.duels && pool.length) pick.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    let w = 0, l = 0;
    const from = idx + 1;
    for (const i of pick) {
      const B = list[i];
      const d = E.duel(A, fighter(B), r);
      if (d.win) w++; else l++;
      matches.push({ milestone: m, defender: B.id, opp: B.nickname, oppRank: i < idx ? i + 1 : i + 2, bot: !!B.is_bot, win: d.win, p: d.p, how: d.how, log: d.log,
        opCard: fighter(B) });
    }
    const delta = Math.round(WORLD.step * (w - l));
    idx = Math.max(0, Math.min(list.length, idx - delta));
    rounds.push({ milestone: m, floor: m * WORLD.per, w, l, delta, from, to: idx + 1 });
  }
  return {
    ladder: rounds.length || me.ladder == null ? ladderAt(list, idx) : me.ladder,
    fightsDone: Math.max(done, last),
    rank: idx + 1,
    startRank,
    total: list.length + 1,
    matches,
    rounds,
  };
}
