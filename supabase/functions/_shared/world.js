// 월드랭킹 대전 계산. 순수 함수라서 브라우저 없이도 시험할 수 있다.
// 순위 = 점수(Elo) 순서. 점수는 체급으로 시작하고, 대전마다 공격한 쪽과 방어한 쪽이 함께 오르내린다.
//   기대 승률 E = 1 / (1 + 10^((상대 점수 − 내 점수) / 400)),  점수 변화 = K × (결과 − E)  (이기면 1, 지면 0)
//   강한 상대를 이기면 많이 오르고, 약한 상대에게 지면 많이 내려간다. 방어한 쪽은 그만큼 반대로 움직인다.
// 끝없는 전장 5층마다 한 번, 점수 순위 앞뒤 10위 안의 상대 4명과 붙는다.
// 다시 등록할 때 체급이 커졌으면 커진 만큼(시작 점수 차이) 점수를 더한다.
export const WORLD = { per: 5, duels: 4, window: 10, maxMilestones: 20, K: 32, base: 1000, scale: 200 };

const KEYS = ['ass', 'rev', 'bls', 'cur'];
export function fighter(c) {
  const o = { name: c.nickname, race: c.race, power: Number(c.power) || 0, hp: Number(c.hp) || 100 };
  for (const k of KEYS) o[k] = Number(c[k]) || 0;
  return o;
}

// 체급으로 정하는 시작 점수 (체급 10배마다 +200점)
export function seedRating(E, c) {
  const m = E.pvpMight ? E.pvpMight(fighter(c)) : Math.max(1, Number(c.power) || 1);
  return WORLD.base + WORLD.scale * Math.log10(Math.max(1, m) / 1e6);
}
export const expect = (ra, rb) => 1 / (1 + Math.pow(10, (rb - ra) / 400));

// me: 이번에 올린 카드(+이전 ladder/r0/fights_done), others: 나머지 카드
export function planWorld(E, me, others, seed) {
  const list = others.map((c) => ({ ...c, ladder: Number(c.ladder) || 0 }));
  const A = fighter(me);
  const r0 = seedRating(E, me);
  let R;
  if (me.ladder == null) R = r0;
  else R = Number(me.ladder) + Math.max(0, r0 - (me.r0 == null ? r0 : Number(me.r0)));
  const rankOf = () => list.filter((c) => c.ladder > R).length + 1;
  const startRank = rankOf();
  const startR = R;
  const done = me.fights_done || 0;
  const target = Math.floor((me.floor || 0) / WORLD.per);
  const last = Math.min(target, done + WORLD.maxMilestones);
  const matches = [];
  const rounds = [];
  const def = {};
  for (let m = done + 1; m <= last; m++) {
    const r = E.rng(E.mixSeed(seed >>> 0, m));
    list.sort((a, b) => b.ladder - a.ladder || String(a.id).localeCompare(String(b.id)));
    const idx = list.filter((c) => c.ladder > R).length;
    const lo = Math.max(0, idx - WORLD.window), hi = Math.min(list.length - 1, idx + WORLD.window - 1);
    const pool = [];
    for (let i = lo; i <= hi; i++) pool.push(i);
    const pick = [];
    while (pick.length < WORLD.duels && pool.length) pick.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);
    let w = 0, l = 0;
    const from = idx + 1, fromR = R;
    for (const i of pick) {
      const B = list[i];
      const ex = expect(R, B.ladder);
      const d = E.duel(A, fighter(B), r);
      const ch = WORLD.K * ((d.win ? 1 : 0) - ex);
      R += ch; B.ladder -= ch; def[B.id] = (def[B.id] || 0) - ch;
      if (d.win) w++; else l++;
      matches.push({ milestone: m, defender: B.id, opp: B.nickname, oppRank: i < idx ? i + 1 : i + 2, bot: !!B.is_bot, win: d.win, p: d.p, how: d.how, log: d.log,
        opCard: fighter(B), ex: Math.round(ex * 1000) / 1000, pts: Math.round(ch * 10) / 10 });
    }
    rounds.push({ milestone: m, floor: m * WORLD.per, w, l, pts: Math.round((R - fromR) * 10) / 10, from, to: rankOf() });
  }
  return {
    ladder: R,
    r0,
    pointsFrom: Math.round(startR),
    points: Math.round(R),
    fightsDone: Math.max(done, last),
    rank: rankOf(),
    startRank,
    total: list.length + 1,
    matches,
    rounds,
    defDeltas: Object.entries(def).map(([id, d]) => ({ id, d })),
  };
}
