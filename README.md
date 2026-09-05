# travel-planner

모바일 퍼스트 여행 플래너 웹앱.

가고 싶은 장소를 리스트에 자유롭게 모아두고, **지도를 보면서 가까운 곳끼리 같은 날에
배치**해 효율적인 코스를 짜는 것이 핵심 워크플로우다. 계획적이면서 즉흥적인 여행
방식을 그대로 지원한다.

## 현재 상태

**Phase 1~9 구현 완료. Phase 10(Supabase)은 마이그레이션·클라이언트 코드까지
준비됐지만 실제 연결은 안 된 상태다** — 아래 [Phase 10 안내](#phase-10--supabase-연동-상태) 참고.
화면은 여전히 React Query + MSW(mock)로 동작한다.

- 여행 카드 리스트 → 여행 생성 폼 → 여행 디테일 6탭(개요/플래너/리스트/비용/준비/메모)
  전부 실제 콘텐츠로 채워져 있다.
- 단위 테스트 59개, e2e 테스트 48개(모바일 Safari + Chrome) 전부 통과.

## 시작하기

```bash
pnpm install
pnpm dev              # http://localhost:3000 — MSW mock 데이터로 바로 동작
pnpm test             # 단위 테스트 (Vitest)
pnpm test:e2e         # e2e 테스트 (Playwright, 모바일 프로파일)
pnpm build && pnpm start
```

Supabase 연결 없이도 모든 화면이 정상 동작한다. `.env.example`을 `.env.local`로
복사해두면 되고, 채우지 않아도 된다.

## Phase 10 — Supabase 연동 상태

**Cloud Agent는 실제 Supabase 계정/프로젝트를 만들 수 없고 Docker도 없다.** 그래서
이 Phase의 목표는 "실제 DB에 연결"이 아니라 "키만 넣으면 바로 붙는 code-ready
상태까지 준비"다. 현재 화면 동작(MSW mock)에는 영향이 없다.

| 산출물 | 위치 | 상태 |
| --- | --- | --- |
| 마이그레이션 9개 | `supabase/migrations/` | `libpg-query`(실제 Postgres 파서)로 문법 검증 완료. **실 DB에 적용해본 적은 없음** |
| 시드 | `supabase/seed.sql` | `src/mocks/fixtures/*.ts`와 동일한 데이터(나고야 여행 전체) |
| 브라우저/서버 클라이언트 | `src/lib/supabase/{client,server}.ts` | `@supabase/ssr` 표준 패턴 |
| 세션 갱신 | `src/proxy.ts` | Next.js 16 `proxy.ts`(구 middleware). **환경변수가 없으면 완전히 no-op** — 이 가드가 없으면 앱 전체가 깨진다는 것을 실제로 확인하고 넣었다 |
| DB 타입 | (아직 없음) | `pnpm db:types`로 실제 프로젝트 연결 후 생성 |

- **마이그레이션**: extensions/enums → trips → overview(accommodations/transports) →
  places → expenses → checklists → wishlist → RLS → views. `src/mocks/fixtures/*.ts`의
  Zod 스키마와 1:1로 대응한다.
- **시드**: 제주·오사카·나고야 3개 여행 + 나고야 트립의 하위 데이터. 로컬 개발용
  더미 사용자를 `auth.users`에 직접 삽입한다.
- **클라이언트 코드**: 실제 프로젝트에 연결되어 있지 않다(환경변수 없으면 호출 시
  런타임 에러).
- **`src/proxy.ts`**: 세션 갱신만 담당하고 인증 경계는 아니다.
- 로그인 UI는 아직 없다.

### 실제로 연결하려면

1. Cursor Dashboard → Cloud Agents → Secrets에 `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 등록한다.
2. `npx supabase link --project-ref <ref>` 후 `pnpm db:push`로 마이그레이션 적용.
3. `pnpm db:types`로 `src/lib/supabase/database.generated.ts` 생성.
4. `src/mocks/msw-provider.tsx`의 `NEXT_PUBLIC_ENABLE_MSW`를 `false`로 두면
   프로덕션 빌드에서 MSW가 꺼지고, `features/*/api.ts`의 `fetch("/api/...")` 호출을
   Supabase 클라이언트 호출로 바꾸면 된다 — 데이터 모델(zod 스키마)과 DB 스키마가
   1:1로 대응하도록 이미 맞춰뒀다.

**RLS**: `is_trip_owner(trip_id)` 단일 함수로 모든 테이블 정책이 소유자 확인을
한다. Auth 로그인 UI는 아직 없다 — 이 부분도 실제 연결 시 추가 작업이 필요하다.

### 스코프 밖 (P10-06, P10-08~11)

RPC(트랜잭션), mock → 실DB 전환, Realtime, Storage, Vercel 배포는 실제
Supabase 프로젝트 없이는 진행할 수 없어 이번 Phase에 포함하지 않았다.

## 문서 구조

기준 문서는 **구현 계획서 v2**다. `docs/08`이 실행 단위 태스크, `docs/09`가 계획서
v2와 v1 설계/전역 룰의 충돌 및 결정 사항이다.

| 문서 | 내용 |
| --- | --- |
| [docs/08-implementation-tasks.md](docs/08-implementation-tasks.md) | 계획서 v2를 Phase 단위 티켓으로 분해 |
| [docs/09-open-decisions.md](docs/09-open-decisions.md) | D1(Tailwind+shadcn)·D2(React Query+MSW)·D10(Notion 스타일) 등 확정된 결정 |
| [docs/01](docs/01-architecture.md)~[07](docs/07-roadmap.md) | v1 설계 참고자료. 알고리즘·실측 디자인 토큰·데이터 모델 원칙은 계획서 v2에서도 재사용됨 |

## 화면 구성

```
스플래시(오버레이) → 랜딩(여행 카드 리스트) → 여행 생성
                      └─ 카드 선택 → 여행 디테일
                                       ├─ 개요    숙소·교통편 CRUD, 요약
                                       ├─ 플래너  mock 지도 + 바텀시트 + DnD + 자동 배치
                                       ├─ 리스트  장소 CRUD, 카테고리 필터, 지도 링크 파싱
                                       ├─ 비용    도넛 차트, 4종 그룹핑, 실시간 환율
                                       ├─ 준비    체크리스트, 프로그레스 바
                                       └─ 메모    위시리스트, DnD 순서 변경
```

## 스택

| 영역 | 선택 |
| --- | --- |
| 프레임워크 | Next.js 16 App Router |
| 스타일 | Tailwind CSS v4 + shadcn/ui |
| 애니메이션 | Framer Motion(제스처) + View Transitions(카드→상세 모프) |
| 데이터 레이어 | React Query + MSW(mock, 활성) / Supabase(코드 준비, 미연결) |
| 지도 | Mock(좌표 정규화 배치). Naver/Google 어댑터 경계는 `lib/map-provider.ts` |
| 알고리즘 | k-means 클러스터링, Held-Karp/2-opt 경로 최적화 (`src/lib/*.ts`) |
| DnD | dnd-kit |
| 차트 | Recharts |
| 폼 | react-hook-form + zod |
| 환율 | Frankfurter (`api.frankfurter.dev`, 키 불필요) |
| 지오코딩 | Nominatim (실제 외부 호출로 검증됨) |
| 테스트 | Vitest(단위) + Playwright(e2e, 모바일 프로파일) |
| 호스팅(예정) | Vercel |
