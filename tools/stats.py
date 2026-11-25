# 접속·플레이 기록을 집계해 숫자만 출력한다 (개별 기록·식별자는 출력하지 않는다).
import json, sys, collections, datetime as dt
D = sys.argv[1]; since = sys.argv[2] if len(sys.argv) > 2 else '2000-01-01'
KST = dt.timezone(dt.timedelta(hours=9))
def t(s): return dt.datetime.fromisoformat(s.replace('Z', '+00:00')).astimezone(KST)
ev = [json.loads(l) for l in open(f'{D}/events.jsonl') if l.strip()]
ev = [e for e in ev if e['ts'] >= since]
users = [json.loads(l) for l in open(f'{D}/users.jsonl') if l.strip()]
runs = json.load(open(f'{D}/runs.json'))
print(f'기준 시각(UTC) {since} 이후')
by = collections.defaultdict(list)
for e in ev: by[e['vid']].append(e)
V = len(by); kinds = collections.Counter(e['kind'] for e in ev)
went = [v for v, es in by.items() if any(e['kind'] == 'go' for e in es)]
died = [v for v, es in by.items() if any(e['kind'] == 'death' for e in es)]
logged = [v for v, es in by.items() if any(e['logged'] for e in es)]
multi = [v for v, es in by.items() if len({e['sid'] for e in es}) > 1]
print(f'방문자(브라우저) {V} · 출정한 방문자 {len(went)} ({len(went)/V*100 if V else 0:.0f}%) · 로그인 상태 방문자 {len(logged)} · 다시 접속한 방문자 {len(multi)}')
print('행동 수:', dict(kinds))
gos = collections.Counter(len([e for e in es if e['kind'] == 'go']) for v, es in by.items() if v in went)
print('방문자당 출정 횟수 분포:', dict(sorted(gos.items())))
mob = sum(1 for e in ev if e['kind'] == 'visit' and (e.get('d') or {}).get('w', 9999) < 900)
print(f'좁은 화면(휴대폰 추정) 방문 {mob} / 전체 방문 {kinds.get("visit",0)}')
refs = collections.Counter(((e.get('d') or {}).get('ref') or '(직접)').split('/')[2] if '://' in ((e.get('d') or {}).get('ref') or '') else '(직접)' for e in ev if e['kind'] == 'visit')
print('유입 경로:', dict(refs.most_common(8)))
W = ['지상계', '지하', '마계', '심연', '공허', '끝없는']
dw = collections.Counter()
for e in ev:
    if e['kind'] == 'death':
        d = e.get('d') or {}; w = d.get('w'); dw[(W[min(5, w)] if isinstance(w, int) and w < 6 else ('사냥터' if isinstance(w, int) else '?'), int(d['pct'] // 10 * 10) if d.get('pct') is not None else None)] += 1
print('사망 위치(세계, 진행% 10단위):', dict(sorted(dw.items(), key=lambda x: str(x[0]))))
first = []
for v, es in by.items():
    g = [e for e in es if e['kind'] == 'go']
    if not g: continue
    d = [e for e in es if e['kind'] == 'death' and e['ts'] > g[0]['ts']]
    if d: first.append(((d[0].get('d') or {}).get('w'), (d[0].get('d') or {}).get('pct')))
c = collections.Counter((W[w] if isinstance(w, int) and w < 6 else '?', int(p // 10 * 10) if p is not None else None) for w, p in first)
print('첫 판 사망 위치:', dict(sorted(c.items(), key=lambda x: str(x[0]))))
hrs = collections.Counter(t(e['ts']).strftime('%m-%d %H시') for e in ev if e['kind'] == 'visit')
print('시간대별 방문(KST):', dict(sorted(hrs.items())))
nu = [u for u in users if u['created_at'] >= since]
print(f'가입자 전체 {len(users)} · 기준 이후 신규 {len(nu)} · 기준 이후 로그인 {sum(1 for u in users if (u.get("last_sign_in_at") or "") >= since)}')
nr = [r for r in runs if r['created_at'] >= since]
print(f'랭킹 등록 판 {len(nr)} (기준 이후) · 도달:', dict(collections.Counter(r['reach'] for r in nr).most_common(8)))
