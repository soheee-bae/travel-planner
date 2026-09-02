# 03. 환경 구성

## 3.1 요구 런타임

| 도구 | 버전 | 비고 |
| --- | --- | --- |
| Node.js | 22 LTS | `.nvmrc`로 고정 |
| pnpm | 10.x | `package.json`의 `packageManager`로 고정 |
| Supabase CLI | 최신 | 마이그레이션·타입 생성·로컬 스택 |
| Docker | 최신 | **로컬 Supabase 스택에만 필요.** 없으면 §3.3의 원격 개발 프로젝트 방식 사용 |

## 3.2 환경 3종

| 환경 | 앱 | DB | 용도 |
| --- | --- | --- | --- |
| **local** | `pnpm dev` (localhost:3000) | 로컬 Supabase (Docker) 또는 `travel-planner-dev` 프로젝트 | 개발 |
| **preview** | Vercel Preview (브랜치별 URL) | `travel-planner-staging` 프로젝트 | PR 검토, 실기기 테스트 |
| **production** | Vercel Production | `travel-planner-prod` 프로젝트 | 실사용 |

Supabase 프로젝트는 **최소 2개**(staging, prod)를 분리한다. 하나로 쓰면 마이그레이션
실수가 실제 여행 데이터를 날린다. 로컬은 Docker 스택이 가장 빠르지만, Docker가
없는 환경에서는 `dev` 프로젝트를 하나 더 만들어 쓴다.

**실기기 테스트가 이 프로젝트에서 특히 중요하다.** 모바일 전용 UI라서 데스크톱
브라우저의 반응형 모드로는 확인이 안 되는 것들이 있다.

- iOS Safari의 스와이프 뒤로가기 제스처와 수평 드래그 충돌
- 주소창 표시/숨김에 따른 `100vh` 점프 (→ `100dvh` 사용)
- 하단 홈 인디케이터 영역(safe-area) 침범
- 롱프레스 시 뜨는 시스템 컨텍스트 메뉴 (→ `-webkit-touch-callout: none`)

Vercel Preview URL을 실제 폰에서 여는 것을 각 단계의 완료 조건에 포함한다.

## 3.3 환경변수

`NEXT_PUBLIC_` 접두사가 붙은 값은 **브라우저 번들에 그대로 박힌다.** 비밀은 절대
이 접두사를 쓰지 않는다.

### 브라우저 노출 (공개)

| 변수 | 예 | 설명 |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` 또는 `sb_publishable_...` | 공개 키. RLS가 방어선이므로 노출 자체는 정상 |
| `NEXT_PUBLIC_MAP_STYLE_URL` | `https://api.maptiler.com/maps/streets/style.json?key=...` | MapLibre 스타일 |
| `NEXT_PUBLIC_SITE_URL` | `https://travel-planner.app` | OAuth 리다이렉트, 공유 링크 생성 |
| `NEXT_PUBLIC_ENABLE_MSW` | `true` / 미설정 | 로컬에서 MSW 목 서버 활성화 |

> Supabase가 API 키 체계를 `anon`/`service_role`에서 `publishable`/`secret`으로
> 옮기는 중이다. **어느 이름이 현재 프로젝트에 적용되는지는 대시보드에서 직접
> 확인해야 한다.** 코드에서는 환경변수 이름만 참조하므로 값만 맞으면 된다.

### 서버 전용 (비밀)

| 변수 | 설명 |
| --- | --- |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS 우회. 공유 링크 검증과 `route_cache` 기록에만 사용. 앱 런타임 CRUD에는 쓰지 않는다 |
| `ROUTING_PROVIDER` | `osrm` \| `mapbox` \| `google` \| `estimate` |
| `ROUTING_BASE_URL` | 자체 호스팅 OSRM 주소 (해당 시) |
| `ROUTING_API_KEY` | 상용 라우팅 API 키 |
| `NOMINATIM_BASE_URL` | 기본 `https://nominatim.openstreetmap.org` |
| `NOMINATIM_USER_AGENT` | Nominatim 이용 정책상 **필수**. 연락 가능한 앱 식별자 |
| `FX_API_KEY` | 환율 API 키 (무료 티어로 충분) |

`NEXT_PUBLIC_MAP_STYLE_URL`에 타일 제공자 키가 들어가는 것은 불가피하다(브라우저가
직접 타일을 받아야 함). 제공자 대시보드에서 **도메인 화이트리스트와 월 상한**을
반드시 걸어둔다. 그게 이 키의 실질적 방어책이다.

무료로 시작하려면 `ROUTING_PROVIDER=estimate`로 두면 된다. 외부 호출 없이
직선거리 기반 추정만 쓴다([06](06-features-and-algorithms.md) §6.5).

### OpenStreetMap 타일 주의

스크린샷은 OSM 기본 타일(Leaflet)을 쓰고 있다. OSM 공용 타일 서버는 **프로덕션
트래픽 용도가 아니다**(Tile Usage Policy). 실제 배포에는 MapTiler·Protomaps 같은
제공자나 자체 타일을 쓴다. 이것이 Leaflet 대신 MapLibre를 택한 이유 중 하나다
— 벡터 타일 제공자 전환이 스타일 URL 교체로 끝난다.

## 3.4 로컬 실행

```bash
pnpm install
cp .env.example .env.local

# A. Docker 있음 — 로컬 스택 (권장)
pnpm supabase start          # Postgres + Studio + Auth 기동, 접속정보 출력
pnpm db:push                 # supabase/migrations 적용
pnpm db:seed                 # 나고야 3일 샘플 데이터
pnpm db:types                # 타입 생성

# B. Docker 없음 — 원격 dev 프로젝트
pnpm supabase link --project-ref <dev-ref>
pnpm db:push

pnpm dev
```

### package.json 스크립트 (예정)

| 스크립트 | 내용 |
| --- | --- |
| `dev` | `next dev` |
| `build` / `start` | 프로덕션 빌드/기동 |
| `typecheck` | `tsc --noEmit` |
| `lint` | ESLint (`--max-warnings 0`) |
| `test` | Vitest (유틸·알고리즘 단위 테스트) |
| `test:e2e` | Playwright (모바일 뷰포트 프로파일) |
| `db:push` / `db:seed` / `db:types` / `db:diff` | Supabase CLI 래퍼 |

## 3.5 마이그레이션 워크플로

```
로컬에서 스키마 수정
   └─ pnpm supabase db diff -f <이름>   → supabase/migrations/<타임스탬프>_<이름>.sql 생성
        └─ 커밋 → PR
             ├─ CI: staging 프로젝트에 적용 후 타입 생성 결과가 커밋과 일치하는지 검증
             └─ 머지 → prod 적용 (수동 승인)
```

규칙:

- 마이그레이션 파일은 **한 번 머지되면 수정하지 않는다.** 되돌릴 때도 새 파일을 추가한다.
- 컬럼 삭제·이름 변경은 2단계로 나눈다. (1) 새 컬럼 추가 + 양쪽 쓰기 → (2) 배포 후 구 컬럼 삭제.
  Vercel의 이전 배포가 잠시 살아있기 때문이다.
- `db:types` 결과를 커밋에 포함한다. CI가 재생성해서 diff가 나면 실패시킨다.

## 3.6 인증 구조 (Next.js 16)

Next.js 16에서 `middleware.ts`는 **`proxy.ts`로 이름이 바뀌었고**, 내보내는 함수도
`middleware` → `proxy`가 되었다. `proxy.ts`는 Node.js 런타임 전용이며 Edge 런타임을
지정할 수 없다. 구 `middleware.ts`는 아직 동작하지만 deprecated다.

```
src/proxy.ts
  └─ @supabase/ssr createServerClient(request/response 쿠키 브리지)
       └─ supabase.auth.getUser()      ← 만료 토큰 갱신. 반드시 호출
            └─ 비로그인 + 보호 경로 → /login 리다이렉트 (?next= 로 복귀 경로 보존)
```

주의점 셋:

1. `createServerClient`와 `getUser()` **사이에 다른 로직을 넣지 않는다.**
   Supabase 문서가 명시적으로 경고하는 부분이고, 어기면 "간헐적 로그아웃"을 디버깅하게 된다.
2. 응답 객체를 새로 만들면 **쿠키를 복사해서 넘겨야 한다.** 안 하면 브라우저와 서버
   세션이 어긋난다.
3. `proxy.ts`는 **인증 경계가 아니다.** 낙관적 리다이렉트 용도일 뿐이고, 실제 권한은
   RLS와 각 Server Component/Route Handler에서 다시 확인한다.

서버 클라이언트에서 `cookies()`는 Next.js 16에서 async다. `await cookies()`로 받고,
Server Component에서는 쿠키를 쓸 수 없으므로 `setAll`을 try/catch로 감싼다
(세션 갱신은 `proxy.ts`가 담당).

## 3.7 CI (GitHub Actions)

```yaml
# .github/workflows/ci.yml (예정)
on: [pull_request]
jobs:
  verify:
    - pnpm install --frozen-lockfile
    - pnpm typecheck
    - pnpm lint
    - pnpm test
    - pnpm build
  db:
    - supabase db push --db-url ${{ secrets.STAGING_DB_URL }}   # 임시 브랜치 DB
    - supabase gen types typescript > /tmp/t.ts
    - diff /tmp/t.ts src/shared/types/database.generated.ts     # 불일치면 실패
  mobile-e2e:
    - pnpm test:e2e --project=mobile-safari --project=mobile-chrome
```

Lighthouse CI로 §1.8의 성능 예산을 PR에서 확인한다. 예산 초과는 경고가 아니라
실패로 둔다 — 모바일 앱에서 번들 크기는 조용히 늘어나기 때문에 게이트가 없으면
반드시 넘친다.

## 3.8 배포

| 대상 | 설정 |
| --- | --- |
| Vercel 프로젝트 | 리전 `icn1`(서울). 주 사용자가 한국이므로 |
| 환경변수 | Vercel의 Production / Preview / Development 스코프에 각각 등록 |
| 브랜치 | `main` → Production. 그 외 브랜치 → Preview |
| Supabase Auth | Redirect URL에 프로덕션 도메인 + `https://*.vercel.app` 등록 |
| 이미지 | 커버 이미지는 Supabase Storage. `next.config.ts`의 `images.remotePatterns`에 도메인 허용 |

Supabase 무료 티어는 **일정 기간 미사용 시 프로젝트가 일시정지**되는 정책이 있다.
개인 프로젝트에서 몇 달 안 열면 걸릴 수 있으니, prod는 유료 전환 시점을 미리 정해두는
편이 안전하다. (구체적 기간·조건은 정책이 바뀌므로 가입 시점에 직접 확인해야 한다.)

## 3.9 PWA

모바일 홈 화면에서 실행하는 것을 목표로 한다 (§07 12단계).

- `app/manifest.ts` — 이름, 아이콘(192/512/maskable), `display: 'standalone'`,
  `theme_color: '#3762E3'`, `background_color: '#EEF2F9'`
- `apple-touch-icon` + iOS 스플래시 이미지 (iOS는 manifest 아이콘만으로 부족)
- Service Worker는 **앱 셸 캐시까지만**. 데이터 캐시는 TanStack Query 영속화가 담당

`display: standalone`이 되면 **브라우저 뒤로가기 버튼이 사라진다.** 앱 내 뒤로가기
버튼과 히스토리 관리를 1단계 레이아웃부터 넣어둬야 나중에 화면을 다시 뜯지 않는다.
