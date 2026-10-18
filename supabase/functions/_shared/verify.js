// 서버 쪽 검증 로직. Deno(Supabase Edge Functions)와 Node 양쪽에서 돌아가는 순수 ES 모듈.
// 게임 엔진(engine.js)은 페이지가 쓰는 파일과 완전히 같은 파일이어야 한다.
import './engine.js';

const E = globalThis.FateEngine;
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
export async function signRun(secret, seed, ts) {
  const key = await hmacKey(secret);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(`fate-hero|${ENGINE_VERSION}|${seed >>> 0}|${ts}`)));
}
function safeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

// 주사위 묶음: 서버 호출 한 번에 용사 후보 BATCH_N개. i번째 후보의 seed = mixSeed(base, i)
export const BATCH_N = 50;
export async function signBatch(secret, base, n, ts) {
  const key = await hmacKey(secret);
  return toHex(await crypto.subtle.sign('HMAC', key, enc.encode(`fate-hero-batch|${ENGINE_VERSION}|${base >>> 0}|${n}|${ts}`)));
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

export function cleanNickname(raw) {
  if (typeof raw !== 'string') return null;
  // 제어 문자, 꺾쇠, 앞뒤 공백 제거, 연속 공백 하나로
  const s = raw.replace(/[\u0000-\u001f\u007f<>]/g, '').replace(/\s+/g, ' ').trim();
  const chars = [...s];
  if (chars.length < 1 || chars.length > 12) return null;
  return s;
}

const OPS = new Set(['c', 'b', 's', 'e', 'n', 'h', 'l', 'S', 'L', 'M', 'T']);

// 요청 본문을 검사하고 기록을 재생한다. 성공하면 { row, summary }, 실패하면 Error를 던진다.
export async function verifySubmission(body, secret, now = Date.now()) {
  if (!body || typeof body !== 'object') throw new Error('잘못된 요청');
  const { version, seed, token, ts, nickname, log } = body;
  if (version !== ENGINE_VERSION) throw new Error('게임 버전이 달라졌다. 새로고침 후 새 용사로 도전해 주세요.');
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('잘못된 seed');
  if (!Number.isInteger(ts)) throw new Error('잘못된 발급 시각');
  if (now - ts > LIMITS.tokenMaxAgeMs) throw new Error('등록 기한이 지난 용사다');
  if (ts - now > 5 * 60 * 1000) throw new Error('잘못된 발급 시각');
  if (body.batch) {
    const { base, i, n } = body.batch;
    if (!Number.isInteger(base) || base < 0 || base > 0xffffffff || !Number.isInteger(n) || n < 1 || n > 1000 || !Number.isInteger(i) || i < 0 || i >= n)
      throw new Error('잘못된 주사위 묶음');
    const expect = await signBatch(secret, base, n, ts);
    if (!safeEqual(expect, token)) throw new Error('서버가 발급하지 않은 용사다');
    if ((E.mixSeed(base, i) >>> 0) !== seed) throw new Error('주사위 묶음과 용사가 맞지 않다');
  } else {
    const expect = await signRun(secret, seed, ts);
    if (!safeEqual(expect, token)) throw new Error('서버가 발급하지 않은 용사다');
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
  let sum;
  try {
    sum = E.replayLog(log);
  } catch (e) {
    throw new Error('기록 재생 실패: ' + (e && e.message ? e.message : String(e)));
  }
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
    version: ENGINE_VERSION,
    updated_at: new Date(now).toISOString(),
  };
  return { row, summary: { hero: row.hero, race: row.race, kills: row.kills, power: row.power, reach: row.reach }, card: sum.card, maxFloorE: Math.max(0, Math.floor(sum.maxFloorE || 0)) };
}
