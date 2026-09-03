# 01. 아키텍처

## 1.1 전체 구성

```
┌──────────────────────────────────────────────────────────────┐
│  브라우저 (모바일 Safari / Chrome)                            │
│                                                              │
│  Next.js App Router                                          │
│   ├─ Server Component  : 초기 데이터 prefetch → dehydrate     │
│   ├─ Client Component  : Emotion / dnd-kit / MapLibre 화면    │
│   └─ TanStack Query    : 서버 상태 단일 소유자                │
└───────┬───────────────────────────────┬──────────────────────┘
        │ ① CRUD 직접 호출               │ ② 비밀키 필요한 호출
        │   (RLS가 인증 경계)             │
        ▼                               ▼
┌────────────────────────┐   ┌──────────────────────────────────┐
│ Supabase               │   │ Next.js Route Handler (BFF)      │
│  · Postgres + PostGIS  │   │  /api/route/estimate  라우팅 프록시│
│  · Auth (쿠키 세션)     │   │  /api/geocode         지오코딩    │
│  · Realtime (구독)      │   │  /api/fx              환율 캐시   │
│  · Storage (커버 이미지)│   └───────┬──────────────────────────┘
└────────────────────────┘           │
                                     ▼
                        OSRM / Directions API, Nominatim, FX API
```

**핵심 결정 두 가지.**

1. **CRUD는 브라우저에서 Supabase로 직접 간다.** Server Action을 거치지 않는다.
   낙관적 업데이트(optimistic update)가 한 번의 왕복도 없이 즉시 반영되고, API 레이어를
   중복 작성하지 않아도 된다. 인증 경계는 Row Level Security가 담당한다.
2. **Route Handler는 "비밀키가 필요한 외부 호출"만 담당한다.** 라우팅 API 키를
   브라우저에 노출할 수 없고, Nominatim은 User-Agent와 레이트리밋 준수가 필요하다.
   서버가 응답을 DB에 캐시해두면 같은 구간을 두 번 조회하지 않는다.

여러 행을 한 트랜잭션으로 바꿔야 하는 작업(일정 변경으로 DAY 재생성, 항목 여러 개를
DAY N으로 이동, 순서 재배치)은 클라이언트에서 루프를 돌리지 않고 **Postgres 함수(RPC)**
한 번으로 처리한다. 상세는 [02-data-model.md](02-data-model.md) §2.5.

## 1.2 렌더링 전략

Emotion은 런타임 CSS-in-JS라서 Server Component에서 동작하지 않는다. Next.js도 이를
명시하고 있다. 따라서 실제 경계는 이렇게 잡는다.

| 계층 | 종류 | 역할 |
| --- | --- | --- |
| `app/**/layout.tsx`, `page.tsx` | Server | 세션 확인, 초기 데이터 prefetch, `HydrationBoundary`로 전달 |
| `features/**/components/*` | Client | 실제 화면. Emotion·제스처·지도·차트 전부 여기 |
| `app/api/**/route.ts` | Server | 외부 API 프록시 + 캐시 기록 |
| `src/proxy.ts` | Server (Node) | Supabase 세션 토큰 갱신, 비로그인 리다이렉트 |

**초기 로딩 패턴** — 스켈레톤을 보여주고 나서 데이터를 받는 게 아니라, 서버에서 미리
받아 하이드레이션한다. 첫 화면에 스피너가 아예 안 뜨는 게 목표다.

```
page.tsx (Server)
  └─ queryClient.prefetchQuery(tripDetailQuery(tripId))
       └─ <HydrationBoundary state={dehydrate(queryClient)}>
            └─ <TripDetailView />   ← Client. 캐시가 이미 채워진 상태로 시작
```

스켈레톤은 두 곳에만 필요하다. `loading.tsx`(라우트 전환 중 서버 응답 대기)와
지도 타일 로드. 그 외에는 낙관적 업데이트로 대체한다.

## 1.3 라우팅

```
/                          랜딩. 여행 카드 리스트
/trips/new                 여행 생성 (바텀시트로 열리는 게 기본, 직접 진입도 허용)
/trips/[tripId]            상세. ?day=2&view=map 으로 일차/뷰 지정
/trips/[tripId]/places     후보 풀 (미배치 장소)
/trips/[tripId]/settings   기간·숙소·통화·인원
/share/[token]             읽기 전용 공유
/auth/callback             Supabase OAuth 콜백
```

**일차 탭과 뷰 탭은 라우트 전환이 아니다.** 스크린샷의 `1일차/2일차/3일차`와
`일정/지도/비용`은 전부 같은 라우트 안에서 쿼리스트링만 바꾼다.

- 이유 1 — 애니메이션을 완전히 통제할 수 있다. 스와이프로 손가락을 따라오는 전환은
  라우트 전환으로는 만들 수 없다.
- 이유 2 — 지도 인스턴스와 스크롤 위치가 유지된다. 탭을 왕복할 때마다 MapLibre를
  다시 초기화하면 모바일에서 체감이 크게 나빠진다.
- 이유 3 — URL에는 남으므로 뒤로가기·공유·새로고침이 모두 동작한다.

`router.replace(url, { scroll: false })`로 히스토리를 오염시키지 않으면서 URL만 갱신한다.

실제 라우트 전환은 **랜딩 → 상세 하나뿐**이고, 여기에 View Transitions로 카드가
펼쳐지는 공유 요소 모프를 붙인다. 상세는 [05-motion-and-navigation.md](05-motion-and-navigation.md).

## 1.4 폴더 구조

기능별(feature-first) 구조. 레이어별(components/hooks/utils 전역 분류)로 나누면
기능 하나 수정할 때 폴더 5개를 오가게 된다.

```
src/
├─ app/                              라우팅과 서버 경계만. 로직 없음
│  ├─ layout.tsx                     html/body, 전역 프로바이더
│  ├─ page.tsx                       랜딩 (Server)
│  ├─ loading.tsx
│  ├─ globals.css                    리셋, CSS 변수, ::view-transition 규칙
│  ├─ trips/
│  │  ├─ new/page.tsx
│  │  └─ [tripId]/
│  │     ├─ layout.tsx               헤더 + 일차 탭 (네비게이션 간 유지)
│  │     ├─ page.tsx                 view 파라미터로 3뷰 스위치
│  │     ├─ loading.tsx
│  │     ├─ places/page.tsx
│  │     └─ settings/page.tsx
│  ├─ share/[token]/page.tsx
│  ├─ auth/callback/route.ts
│  └─ api/
│     ├─ route/estimate/route.ts
│     ├─ geocode/route.ts
│     └─ fx/route.ts
│
├─ features/
│  ├─ trips/            여행 CRUD, 카드 리스트, 커버 이미지
│  ├─ places/           후보 풀, 장소 검색·추가, 카테고리
│  ├─ itinerary/        타임라인 뷰, DnD, 멀티셀렉트, 시간 배치
│  ├─ map/              MapLibre 래퍼, 번호 마커, 경로선
│  ├─ cost/             비용 뷰, 파이차트, 환율
│  ├─ planner/          클러스터 제안, 순서 최적화, 경고 검사
│  └─ today/            여행 중 "오늘" 모드
│     각 feature 내부:
│       api.ts          Supabase 쿼리/뮤테이션 함수
│       queries.ts      queryKey + queryOptions 정의
│       hooks.ts        useXxx 훅 (낙관적 업데이트 포함)
│       schema.ts       Zod 스키마 + 파생 타입
│       components/     Emotion 컴포넌트
│
├─ shared/
│  ├─ ui/               Button, Card, Sheet, Tabs, Badge, Chip, Skeleton, Pill
│  ├─ motion/           모션 토큰, useSwipeable, usePressFeedback, useReducedMotion
│  ├─ lib/
│  │  ├─ supabase/      client.ts (브라우저) / server.ts (서버)
│  │  ├─ query.ts       QueryClient 기본 설정
│  │  ├─ geo.ts         haversine, 도보시간 추정, 좌표 유틸
│  │  └─ format.ts      통화·시간·거리 포맷
│  ├─ styles/           tokens.ts, theme.ts, emotion-provider.tsx
│  └─ types/            database.generated.ts (Supabase CLI 산출물)
│
├─ mocks/               MSW 핸들러 + fixtures (스크린샷의 나고야 3일 일정)
└─ proxy.ts             Next 16 세션 갱신 (구 middleware.ts)

supabase/
├─ migrations/          순번 SQL 파일
└─ seed.sql             개발용 시드 = mocks fixtures와 동일 데이터
```

`mocks`의 픽스처와 `supabase/seed.sql`을 **같은 데이터**로 유지하는 게 중요하다.
MSW로 만든 UI가 실제 DB에 붙였을 때 그대로 보여야 회귀를 빨리 잡는다.

## 1.5 상태 소유권

중복 소유를 만들지 않는 것이 유일한 규칙이다.

| 상태 | 소유자 | 예 |
| --- | --- | --- |
| 서버 데이터 | TanStack Query **단독** | trips, places, itinerary_items, expenses |
| 화면 좌표 상태 | URL 쿼리스트링 | `?day=2&view=map` |
| 일시적 UI | `useState` / `useReducer` | 시트 열림, 선택 모드, 드래그 중 위치 |
| 파생 계산 | 렌더 중 계산 또는 DB View | 일자별 소계, 카테고리 비율 |

서버 데이터를 `useState`로 복사하지 않는다. 폼은 React Hook Form이 편집 중 값만
들고 있고, 제출 성공 시 캐시가 진실의 원천이 된다.

**전역 스토어(Zustand 등)는 도입하지 않는다.** 위 4가지로 충분하고, 하나 더 늘리면
"이 값은 어디 있지"를 매번 묻게 된다.

## 1.6 데이터 흐름 — 추가/수정/삭제 즉시 반영

```
사용자 액션
   │
   ├─ 1. onMutate: 캐시를 즉시 수정 → UI가 먼저 바뀐다 (0ms 체감)
   │
   ├─ 2. Supabase 호출 (RLS 통과)
   │        성공 → 서버 응답으로 캐시 정합화
   │        실패 → onError에서 스냅샷 롤백 + 토스트 "저장 실패, 다시 시도"
   │
   └─ 3. Realtime 구독이 같은 변경을 브로드캐스트
            → 다른 기기/탭의 캐시도 갱신
```

Realtime 구독은 `trip_id` 단위 채널 하나로 묶는다. 테이블별로 채널을 열면 상세
화면 하나가 연결을 5개 잡는다.

자기 자신이 만든 변경이 Realtime으로 되돌아와 낙관적 결과를 덮어쓰지 않도록,
뮤테이션에 클라이언트 세션 ID를 실어 보내고 자기 이벤트는 무시한다.

## 1.7 오프라인 고려

지하철·해외 로밍 환경에서 쓰게 된다. 1단계에서는 넣지 않지만 구조는 막지 않는다.

- `persistQueryClient` + IndexedDB로 캐시 영속화 → 재접속 시 즉시 표시
- 실패한 뮤테이션을 큐에 쌓아 온라인 복귀 시 재시도
- 지도 타일 오프라인 캐시는 범위가 커서 별도 판단 필요

이를 위해 **모든 뮤테이션은 멱등(idempotent)하게** 설계한다. 클라이언트에서
UUID를 생성해 보내면 재시도가 중복 행을 만들지 않는다.

## 1.8 성능 예산

모바일 3G/저가 안드로이드 기준. 1단계부터 CI에서 측정한다.

| 항목 | 목표 |
| --- | --- |
| 랜딩 LCP | < 2.0s (4G), < 3.5s (저속 3G) |
| INP (탭·드래그) | < 200ms |
| CLS | < 0.05 (스켈레톤과 실제 콘텐츠 높이 일치) |
| 초기 JS (랜딩) | < 180KB gzip |
| 지도 번들 | 지연 로드. `view=map` 진입 시에만 |

MapLibre와 Recharts는 랜딩 번들에 들어가면 안 된다. 뷰 탭 전환 시
`next/dynamic`으로 불러오고, 로드 중에는 해당 뷰의 스켈레톤을 보여준다.
