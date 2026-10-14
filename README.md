# 운명의 용사 · 공개 배포 안내

게임 화면은 정적 호스팅에, 랭킹은 Supabase(무료 플랜으로 시작 가능)에 올린다.
처음 한 번 30분 정도 걸린다.

## 폴더 구성

```
fate-hero/
├─ public/                  ← 정적 호스팅에 그대로 올리는 폴더
│  ├─ index.html            게임 화면
│  ├─ engine.js             게임 엔진 (서버와 같은 파일)
│  └─ config.js             Supabase 주소와 공개 키 (2단계에서 채움)
└─ supabase/
   ├─ migrations/0001_init.sql        랭킹 테이블, 읽기 전용 정책, 순위 계산 함수
   ├─ config.functions.toml           함수 설정 (JWT 검사 끔)
   └─ functions/
      ├─ _shared/engine.js            게임 엔진 (public/engine.js와 같은 파일)
      ├─ _shared/verify.js            서명 확인 + 기록 재생 검증
      ├─ _shared/http.ts              CORS, DB 호출 도우미
      ├─ start-run/index.ts           새 용사의 seed를 서버가 발급
      └─ submit-run/index.ts          기록을 재생해 검증한 뒤 랭킹 등록
```

## 랭킹이 조작을 막는 방식

1. 용사를 뽑을 때 서버(start-run)가 seed를 정하고 서명해서 준다. 브라우저가 seed를 고를 수 없다.
2. 플레이하는 동안 페이지는 결정, 구매, 판매, 강화, 다음 세계, 사냥터 출입, 저장 지점 불러오기를 전부 기록한다.
3. 등록하면 서버(submit-run)가 서명을 확인하고, 같은 엔진으로 그 기록을 처음부터 다시 재생한다.
   처치 수, 전투력, 도달 기록은 브라우저가 보낸 값이 아니라 서버가 재생해서 얻은 값으로 저장한다.
4. 지상계에서 시작한 용사만 오른다. 같은 용사를 다시 등록하면 마지막 기록으로 갱신된다.
5. 테이블은 누구나 읽을 수만 있고, 쓰기는 서버 함수만 할 수 있다.

막지 못하는 것: seed가 정해지면 그 판의 운도 정해진다. 그래서 개발자 도구를 다룰 줄 아는 사람이 같은 seed로 여러 선택지를 몰래 미리 돌려 보고 가장 좋은 길만 골라 등록할 수 있다. 결과는 "게임 규칙 안에서 가능한 플레이"라서 서버가 가려내지 못한다. 막으려면 매 행동을 서버에서 처리해야 하는데, 이 규모의 게임에는 과하다고 판단해 넣지 않았다.

## 1단계 · Supabase 준비

1. https://supabase.com 에서 가입하고 새 프로젝트를 만든다. 지역은 Northeast Asia (Seoul)이 가깝다.
2. 왼쪽 메뉴 **SQL Editor**에서 `supabase/migrations/0001_init.sql` 내용을 통째로 붙여 넣고 Run을 누른다.
   여러 번 실행해도 안전하다.
3. 서명용 비밀값을 하나 만든다. 아무 긴 무작위 문자열이면 된다. 예를 들어 터미널에서:
   ```
   openssl rand -hex 32
   ```
   이 값은 어디에도 공개하지 않는다.

## 2단계 · 서버 함수 배포 (Supabase CLI)

Supabase CLI가 필요하다. 설치 방법은 https://supabase.com/docs/guides/local-development/cli/getting-started 에 운영체제별로 있다.

`fate-hero` 폴더에서:

```
supabase login
supabase init                              # supabase/config.toml이 만들어진다
```

`supabase/config.functions.toml`의 내용을 방금 만들어진 `supabase/config.toml` 맨 끝에 붙여 넣는다.
그다음:

```
supabase link --project-ref <프로젝트 ID>   # 대시보드 주소 supabase.com/dashboard/project/<여기>
supabase secrets set RUN_SECRET=<1단계에서 만든 비밀값>
supabase functions deploy start-run --no-verify-jwt
supabase functions deploy submit-run --no-verify-jwt
```

`SUPABASE_URL`과 서버용 키는 Supabase가 함수에 자동으로 넣어 주므로 따로 설정하지 않는다.

배포 확인 (주소의 `<ref>`를 프로젝트 ID로 바꾼다):

```
curl -X POST https://<ref>.supabase.co/functions/v1/start-run
```

`{"seed":..., "ts":..., "token":"..."}`가 나오면 정상이다.

## 3단계 · 게임 화면 설정

`public/config.js`를 연다. 다음 두 값을 넣는다.
- `supabaseUrl`: `https://<ref>.supabase.co`
- `anonKey`: 대시보드 **Project Settings → API Keys**의 anon(public) 키 또는 publishable 키

이 키는 원래 공개용이라 화면에 넣어도 된다.
service_role 키나 secret 키는 절대 넣지 않는다.

## 4단계 · 정적 호스팅에 올리기

어느 곳이든 `public` 폴더만 올리면 된다. 예시로 Cloudflare Pages는 다음 순서다.

1. Cloudflare 대시보드에서 **Workers & Pages → Create application**으로 간다.
2. 드래그 앤 드롭 업로드를 고른다.
3. 프로젝트 이름을 정하고 `public` 폴더를 끌어다 놓은 뒤 배포한다.

명령줄을 쓰려면 `npx wrangler pages deploy public`을 실행한다.
Netlify Drop이나 GitHub Pages도 같은 방식으로 된다.

배포 주소로 들어가면 화면 위쪽에 **랭킹** 버튼이 생긴다. 한 판이 끝나면 결과 카드 아래에 닉네임 입력칸이 나온다.

## 휴대폰에서

배포 주소를 휴대폰 브라우저로 열면 그대로 플레이된다. 화면이 좁으면 결정 카드 → 정비(소지품·강화/상점 탭) → 용사 명부 순서로 쌓인다.
Safari의 공유 → "홈 화면에 추가", Chrome의 메뉴 → "홈 화면에 추가"를 누르면 앱처럼 아이콘이 생기고 주소창 없이 열린다.
배경음은 휴대폰 정책상 화면을 한 번 누른 뒤에 나온다. 무음 모드(아이폰 옆 스위치)에서는 소리가 나지 않을 수 있다.

## 운영 메모

- **게임을 고칠 때**: `engine.js`를 바꿨다면 두 가지를 한다.
  - `public/engine.js`와 `supabase/functions/_shared/engine.js`를 똑같이 맞춘다.
  - 파일 안의 `ENGINE_VERSION`을 올린다. 옛 버전 기록은 "게임 버전이 달라졌다"로 거절된다.
  - 맞추지 않으면 서버 재생 결과가 달라져 등록이 실패한다.
- **랭킹 초기화**: SQL Editor에서 `truncate public.runs;`를 실행한다.
- **부적절한 닉네임 삭제**: `delete from public.runs where nickname = '...';`를 실행한다.
- **다른 사이트에서 함수 호출 막기**: `supabase secrets set ALLOWED_ORIGIN=https://내도메인`을 실행한다.
  기본값은 모든 출처 허용이다.
- **등록 기한**: 용사를 뽑은 뒤 45일까지 등록할 수 있다. `verify.js`의 `LIMITS`에서 바꾼다.
- **브라우저 저장소**: 게임 진행, 저장 지점, 행동 기록은 플레이어 브라우저(localStorage)에 남는다.
  브라우저 데이터를 지우면 등록 전 기록도 사라진다.
- **config.js가 비어 있을 때**: 랭킹 없이 혼자 하는 게임으로 동작한다.
