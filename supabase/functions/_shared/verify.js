// 서버 쪽 검증 로직. Deno(Supabase Edge Functions)와 Node 양쪽에서 돌아가는 순수 ES 모듈.
// 게임 엔진(engine.js)은 페이지가 쓰는 파일과 완전히 같은 파일이어야 한다.
// 이전 버전 엔진을 먼저 불러 따로 보관한다. 업데이트 직전에 시작한 용사의 기록은 그 버전 엔진으로 재생해야 결과가 같다.
import './engine_1_5_2.js';
import './engine_1_5_3.js';
import './engine_1_5_4.js';
import './engine_1_5_5.js';
import './engine_1_5_6.js';
import './engine_1_5_7.js';
import './engine_1_5_8.js';
import './engine_1_5_9.js';
import './engine_1_6_0.js';
import './engine_1_7_0.js';
import './engine_1_7_1.js';
import './engine_1_8_0.js';
import './engine_1_9_0.js';
import './engine_1_9_1.js';
import './engine_1_9_2.js';
import './engine_1_9_3.js';
import './engine_1_9_4.js';
import './engine_1_9_5.js';
import './engine_1_9_6.js';
import './engine_1_9_7.js';
import './engine_1_10_0.js';
import './engine_1_10_1.js';
import './engine_1_10_2.js';
import './engine_1_11_0.js';
import './engine.js';

const E = globalThis.FateEngine;
const ENGINES = { [E.ENGINE_VERSION]: E };
for (const old of [globalThis.FateEngine_1_11_0, globalThis.FateEngine_1_10_2, globalThis.FateEngine_1_10_1, globalThis.FateEngine_1_10_0, globalThis.FateEngine_1_9_7, globalThis.FateEngine_1_9_6, globalThis.FateEngine_1_9_5, globalThis.FateEngine_1_9_4, globalThis.FateEngine_1_9_3, globalThis.FateEngine_1_9_2, globalThis.FateEngine_1_9_1, globalThis.FateEngine_1_9_0, globalThis.FateEngine_1_8_0, globalThis.FateEngine_1_7_1, globalThis.FateEngine_1_7_0, globalThis.FateEngine_1_6_0, globalThis.FateEngine_1_5_9, globalThis.FateEngine_1_5_8, globalThis.FateEngine_1_5_7, globalThis.FateEngine_1_5_6, globalThis.FateEngine_1_5_5, globalThis.FateEngine_1_5_4, globalThis.FateEngine_1_5_3, globalThis.FateEngine_1_5_2]) if (old && !ENGINES[old.ENGINE_VERSION]) ENGINES[old.ENGINE_VERSION] = old;
export const ACCEPT_VERSIONS = Object.keys(ENGINES);
export const ENGINE_VERSION = E.ENGINE_VERSION;

export const LIMITS = {
  maxActions: 30000,                     // 행동 수 상한
  maxBodyBytes: 1_500_000,               // 요청 본문 상한
  tokenMaxAgeMs: 45 * 24 * 3600 * 1000,  // 발급 후 45일까지 등록 가능
};

const enc = new TextEncoder();

async function hmacKey(secret) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
}
function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
// 서명에 들어간 버전 표시는 발급 당시 서버 버전이다. 서버가 업데이트되는 사이에 발급된 용사도 인정하도록 이전 버전 표시도 받아 준다.
// (서명 자체는 비밀 키로만 만들 수 있으므로 버전 표시를 넓혀도 위조 위험은 늘지 않는다)
export const SIGN_VERSIONS = [ENGINE_VERSION, '1.11.0', '1.10.2', '1.10.1', '1.10.0', '1.9.7', '1.9.6', '1.9.5', '1.9.4', '1.9.3', '1.9.2', '1.9.1', '1.9.0', '1.8.0', '1.7.1', '1.7.0', '1.6.0', '1.5.9', '1.5.8', '1.5.7', '1.5.6', '1.5.5', '1.5.4', '1.5.3', '1.5.2', '1.5.1', '1.5.0'].filter((v, i, a) => a.indexOf(v) === i);
export async function signRun(secret, seed, ts, ver = ENGINE_VERSION) {
  const key = await hmacKey(secret);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(`fate-hero|${ver}|${seed >>> 0}|${ts}`)));
}
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// 주사위 묶음: 서버 호출 한 번에 용사 후보 BATCH_N개. i번째 후보의 seed = mixSeed(base, i)
export const BATCH_N = 50;
export async function signBatch(secret, base, n, ts, ver = ENGINE_VERSION) {
  const key = await hmacKey(secret);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(`fate-hero-batch|${ver}|${base >>> 0}|${n}|${ts}`)));
}
async function anyVersion(f, token) {
  for (const v of SIGN_VERSIONS) if (safeEqual(await f(v), token)) return true;
  return false;
}
export async function issueBatch(secret, now = Date.now()) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const base = buf[0] >>> 0;
  return { batch: 1, base, n: BATCH_N, ts: now, token: await signBatch(secret, base, BATCH_N, now) };
}

// 새 용사의 seed와 서명을 만든다.
export async function issueRun(secret, now = Date.now()) {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  const seed = buf[0] >>> 0;
  const ts = now;
  return { seed, ts, token: await signRun(secret, seed, ts) };
}

// 용사 연대기 업적 칭호 (페이지의 ACH 목록과 같아야 한다). 목록에 없는 글자는 받지 않는다.
export const TITLES = new Set(['지배자 사냥꾼', '지상계의 구원자', '옥좌의 정복자', '백층의 전설', '끝을 모르는 자', '신화를 빚은 자', '명장', '도박의 신', '운명을 아는 자', '가문의 기둥', '동료의 왕', '죽지 않는 자', '왕가의 피', '선택받은 자']);
export function cleanTitle(raw) { return typeof raw === 'string' && TITLES.has(raw) ? raw : null; }

export function cleanNickname(raw) {
  if (typeof raw !== 'string') return null;
  // 제어 문자, 꺾쇠, 앞뒤 공백 제거, 연속 공백 하나로
  const s = raw.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim();
  const chars = [...s];
  if (chars.length < 1 || chars.length > 12) return null;
  return s;
}

// 업데이트 전후에 걸쳐 둔 판: 페이지를 새로 열면 저장 지점(L)에서 새 버전 엔진으로 이어 간다.
// 그래서 L마다 같은 버전이나 더 새 버전으로 바뀌는 것만 허용해 재생한다. 모든 행동은 어느 한 공식 버전에서 유효해야 한다.
function stepOp(EV, s, a, snap) {
  const op = a[0];
  if (op === 'c') { const c = EV.current(s); if (!c) return '결정할 것이 없다'; const o = c.options.find((x) => x.id === a[1]); if (!o || o.disabled) return `고를 수 없는 선택지 ${a[1]}`; EV.choose(s, a[1]); return null; }
  let ok = true;
  if (op === 'b') ok = !!EV.buy(s, a[1] | 0); else if (op === 's') ok = !!EV.sell(s, a[1] | 0); else if (op === 'e') ok = !!EV.enhanceSync(s, a[1] | 0, snap);
  else if (op === 'M') ok = !!EV.mythFuseSync(s, snap); else if (op === 'T') ok = EV.travelHunt(s, a[1] | 0); else if (op === 'n') ok = EV.advanceStage(s);
  else if (op === 'h') ok = EV.enterHunt(s); else if (op === 'l') ok = EV.leaveHunt(s); else return `알 수 없는 행동 ${op}`;
  return ok ? null : `${op} 실행 불가`;
}
export function replayMixed(log, order) {
  const seed = log[0][1] >>> 0, startStage = log[0][2] | 0;
  const segEnds = []; for (let i = 1; i < log.length; i++) if (log[i][0] === 'L') segEnds.push(i); segEnds.push(log.length);
  let tries = 0;
  // 구간 k를 엔진 ei로 재생. state: {s, snap, loads}
  function run(k, ei, st) {
    if (++tries > 40) return null;
    const EV = ENGINES[order[ei]];
    let s, snap = st.snap ? JSON.parse(JSON.stringify(st.snap)) : null, loads = st.loads;
    const from = k === 0 ? 1 : segEnds[k - 1];
    if (k === 0) s = EV.newRun(EV.makeHero(seed), startStage, EV.mixSeed(seed, 1));
    else { const a = log[from]; loads++; s = EV.restoreRun(snap, EV.makeHero(seed), EV.mixSeed(seed, 100 + loads), a[1] === 1); }
    const to = segEnds[k];
    for (let i = k === 0 ? 1 : from + 1; i < to; i++) {
      const a = log[i];
      if (a[0] === 'S') { snap = EV.snapshotRun(s); continue; }
      if (s.dead) return null;
      if (a[0] === 'c' && s.over) return null;
      if (stepOp(EV, s, a, snap)) return null;
    }
    if (to >= log.length) return { EV, s, loads, used: [order[ei]] };
    if (!snap) return null;
    for (let ej = ei; ej < order.length; ej++) { const r = run(k + 1, ej, { snap, loads }); if (r) { if (r.used[0] !== order[ei]) r.used.unshift(order[ei]); return r; } }
    return null;
  }
  for (let ei = 0; ei < order.length; ei++) { const r = run(0, ei, { snap: null, loads: 0 }); if (r) return { seed, startStage, loads: r.loads, actions: log.length, ...r.EV.runSummary(r.s), versions: r.used }; }
  return null;
}

const OPS = new Set(['c', 'b', 's', 'e', 'n', 'h', 'l', 'S', 'L', 'M', 'T', 'W', 'G', 'H']);

// 요청 본문을 검사하고 기록을 재생한다. 성공하면 { row, summary }, 실패하면 Error를 던진다.
export async function verifySubmission(body, secret, now = Date.now()) {
  if (!body || typeof body !== 'object') throw new Error('잘못된 요청');
  const { version, seed, token, ts, nickname, log } = body;
  const EV = ENGINES[version];
  if (!EV) throw new Error('게임 버전이 달라졌다. 새로고침 후 새 용사로 도전해 주세요.');
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('잘못된 seed');
  if (!Number.isInteger(ts)) throw new Error('잘못된 발급 시각');
  if (now - ts > LIMITS.tokenMaxAgeMs) throw new Error('등록 기한이 지난 용사다');
  if (ts - now > 5 * 60 * 1000) throw new Error('잘못된 발급 시각');
  if (body.batch) {
    const { base, i, n } = body.batch;
    if (!Number.isInteger(base) || base < 0 || base > 0xffffffff || !Number.isInteger(n) || n < 1 || n > 1000 || !Number.isInteger(i) || i < 0 || i >= n)
      throw new Error('잘못된 주사위 묶음');
    if (!(await anyVersion((v) => signBatch(secret, base, n, ts, v), token))) throw new Error('서버가 발급하지 않은 용사다');
    if ((EV.mixSeed(base, i) >>> 0) !== seed) throw new Error('주사위 묶음과 용사가 맞지 않다');
  } else {
    if (!(await anyVersion((v) => signRun(secret, seed, ts, v), token))) throw new Error('서버가 발급하지 않은 용사다');
  }
  const nick = cleanNickname(nickname);
  if (!nick) throw new Error('닉네임은 1~12자로 입력해 주세요');
  if (!Array.isArray(log) || log.length < 2) throw new Error('기록이 비어 있다');
  if (log.length > LIMITS.maxActions) throw new Error('기록이 너무 길다');
  const first = log[0];
  if (!Array.isArray(first) || first[0] !== 'start' || first[1] !== seed || first[2] !== 0)
    throw new Error('지상계에서 시작한 용사만 랭킹에 오른다');
  for (let i = 1; i < log.length; i++) {
    const a = log[i];
    if (!Array.isArray(a) || a.length < 1 || a.length > 2 || !OPS.has(a[0])) throw new Error(`${i}번째 행동 형식 오류`);
    if (a.length === 2 && typeof a[1] !== 'string' && !Number.isInteger(a[1])) throw new Error(`${i}번째 행동 형식 오류`);
    if (typeof a[1] === 'string' && a[1].length > 32) throw new Error(`${i}번째 행동 형식 오류`);
  }
  // 보낸 버전 엔진으로 먼저 재생하고, 어긋나면 보관 중인 다른 공식 버전으로도 재생해 본다.
  // (업데이트 전 페이지에서 둔 판을 업데이트 후 페이지에서 등록하면 버전 표시만 새 것으로 붙는다)
  let sum, usedVersion = version, firstErr = null;
  for (const v of [version, ...ACCEPT_VERSIONS.filter((x) => x !== version)]) {
    try { sum = ENGINES[v].replayLog(log); usedVersion = v; break; }
    catch (e) { if (!firstErr) firstErr = e; }
  }
  if (!sum && log.some((a) => a[0] === 'L')) {
    const order = ACCEPT_VERSIONS.slice().sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const r = replayMixed(log, order);
    if (r) { sum = r; usedVersion = r.versions[r.versions.length - 1]; }
  }
  if (!sum) throw new Error('기록 재생 실패: ' + (firstErr && firstErr.message ? firstErr.message : String(firstErr)));
  const row = {
    seed,
    nickname: nick,
    hero: String(sum.hero).slice(0, 40),
    race: String(sum.race).slice(0, 20),
    kills: Math.max(0, Math.floor(sum.kills)),
    power: Math.max(0, Math.floor(sum.power)),
    reach: String(sum.reach).slice(0, 60),
    reach_score: sum.reachScore,
    actions: log.length,
    version: usedVersion,
    title: cleanTitle(body.title),
    rare_comp: Array.isArray(sum.rare) ? sum.rare.slice(0, 4).map((x) => String(x).slice(0, 20)).join(',') : '',
    updated_at: new Date(now).toISOString(),
  };
  return { row, summary: { hero: row.hero, race: row.race, kills: row.kills, power: row.power, reach: row.reach }, card: sum.card, legacy: Array.isArray(log[1]) && log[1][0] === 'G' ? String(log[1][1]) : '', hbuff: (() => { const h = log.slice(1, 3).find((x) => Array.isArray(x) && x[0] === 'H'); return h ? String(h[1]) : ''; })(), rawTitle: typeof body.title === 'string' ? body.title.slice(0, 30) : null, alive: !sum.dead, wbActs: log.filter((a) => a[0] === 'W').map((a) => String(a[1])), maxFloorE: Math.max(0, Math.floor(sum.maxFloorE || 0)) };
}
