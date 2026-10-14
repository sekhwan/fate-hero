// 공통 CORS와 Supabase REST 호출 도우미
export const cors = {
  'Access-Control-Allow-Origin': Deno.env.get('ALLOWED_ORIGIN') ?? '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

export function runSecret(): string {
  const s = Deno.env.get('RUN_SECRET');
  if (!s || s.length < 16) throw new Error('RUN_SECRET이 설정되지 않았다');
  return s;
}

// 서버 전용 키. 직접 넣은 SERVICE_KEY 시크릿 → 자동 제공 SUPABASE_SERVICE_ROLE_KEY → SUPABASE_SECRET_KEYS.default 순서로 찾는다.
export function adminHeaders(): Record<string, string> {
  let key = Deno.env.get('SERVICE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!key) {
    // 레거시 키가 없는 새 프로젝트: SUPABASE_SECRET_KEYS({"default":"sb_secret_..."})에서 꺼낸다
    try { key = JSON.parse(Deno.env.get('SUPABASE_SECRET_KEYS') ?? '{}').default; } catch { /* 없음 */ }
  }
  if (!key) throw new Error('서비스 키가 없다');
  const h: Record<string, string> = { apikey: key, 'Content-Type': 'application/json' };
  if (key.startsWith('eyJ')) h.Authorization = `Bearer ${key}`;
  return h;
}

export function restUrl(path: string): string {
  const base = (Deno.env.get('SUPABASE_URL') ?? '').replace(/\/$/, '');
  if (!base) throw new Error('SUPABASE_URL이 없다');
  return `${base}/rest/v1/${path}`;
}
