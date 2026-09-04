# travel-planner

모바일 퍼스트 여행 플래너 웹앱.

가고 싶은 장소를 리스트에 자유롭게 모아두고, **지도를 보면서 가까운 곳끼리 같은 날에
배치**해 효율적인 코스를 짜는 것이 핵심 워크플로우다. 계획적이면서 즉흥적인 여행
방식을 그대로 지원한다.

## 문서 구조

기준 문서는 **구현 계획서 v2**다. `docs/08`이 실행 단위 태스크이고, `docs/09`의
착수 차단 항목(D1·D2·D10)은 2026-09-03 확정되었다 — Tailwind+shadcn/ui, React
Query+MSW, Notion 스타일(웜 미니멀리즘·serif 헤딩). Phase 1 구현 중.

| 문서 | 상태 | 내용 |
| --- | --- | --- |
| [docs/08-implementation-tasks.md](docs/08-implementation-tasks.md) | **실행 기준** | 계획서 v2를 PR 단위 티켓으로 분해. Phase 1~10 |
| [docs/09-open-decisions.md](docs/09-open-decisions.md) | **결정 대기** | 계획서 v2와 v1 설계의 충돌 11건. D1·D2·D10은 착수 차단 |
| [docs/01-architecture.md](docs/01-architecture.md) | v1 참고 | 렌더링 경계, 상태 소유권, 성능 예산 |
| [docs/02-data-model.md](docs/02-data-model.md) | v1 참고 | RLS, 집계 View, 트랜잭션 RPC, 인덱스 설계 |
| [docs/03-environments.md](docs/03-environments.md) | v1 참고 | 환경 3종, 환경변수, 마이그레이션, CI |
| [docs/04-design-system.md](docs/04-design-system.md) | v1 참고 | **스크린샷 실측 색상 토큰 + 대비 검증 결과** |
| [docs/05-motion-and-navigation.md](docs/05-motion-and-navigation.md) | v1 참고 | View Transitions 4패턴, 제스처 레이어 |
| [docs/06-features-and-algorithms.md](docs/06-features-and-algorithms.md) | v1 참고 | 클러스터링, 경로 최적화, 이동시간·비용 자동화 |
| [docs/07-roadmap.md](docs/07-roadmap.md) | 대체됨 | v1 단계 계획. `docs/08`이 대신한다 |

`v1 참고` 문서는 스택 선택이 계획서 v2와 다르지만, 알고리즘·데이터 모델·접근성
검증 내용은 그대로 유효하다. 특히 `docs/04`의 실측 색상값과 명도 대비 계산,
`docs/06`의 좌표 보정·경로 최적화는 계획서 v2에서도 재사용한다.

> 계획서 v2 원문은 아직 레포에 없다. `docs/plan-v2.md`로 커밋해두면 태스크 문서가
> 섹션을 정확히 참조할 수 있다.

## 화면 구성 (계획서 v2)

```
로딩 스플래시 → 랜딩(여행 카드 리스트) → 여행 생성
                      └─ 카드 선택 → 여행 디테일
                                       ├─ 개요    숙소·교통·요약
                                       ├─ 플래너  지도 + 바텀시트 일정 (핵심)
                                       ├─ 리스트  장소 카테고리별 관리
                                       ├─ 비용    파이차트 + 그룹핑
                                       ├─ 준비    체크리스트
                                       └─ 메모    위시리스트
```

## 스택 (계획서 v2 + 확정 결정)

| 영역 | 선택 | 비고 |
| --- | --- | --- |
| 프레임워크 | Next.js 16 App Router | D3 확정 |
| 스타일 | **Tailwind CSS v4 + shadcn/ui** | D1 확정 |
| 디자인 방향 | **Notion 스타일** (웜 미니멀리즘·serif 헤딩·soft surface) | D10 확정, 카테고리 팔레트는 실측값 재사용 |
| 애니메이션 | Framer Motion (제스처) + View Transitions (라우트 전환) | D3 |
| 데이터 레이어 | **React Query + MSW** (Phase 1~9), Supabase 연동은 Phase 10 | D2 확정 |
| 지도 | Naver(한국) / Google(해외), 어댑터 먼저 구현 1개부터 | D4 |
| 차트 | Recharts | |
| DnD | dnd-kit | 터치 200ms 홀드 |
| 환율 | Frankfurter (`api.frankfurter.dev`) | 검증 완료 (D11) |
| 호스팅 | Vercel | 리전 `icn1` 권장 |

## 현재 상태

Phase 1~9(Next.js 셋업 → 스플래시+랜딩 → 여행 생성 폼 → 6탭 디테일 → 리스트/장소 →
플래너/지도 → 비용 → 준비/체크리스트 → 메모/위시리스트)까지 구현·커밋 완료. 데이터
레이어는 React Query + MSW가 계속 활성 상태다. `docs/08`의 Phase 단위로 하나씩
구현하고 커밋·리뷰 후 다음 Phase로 진행한다.

## Phase 10 — Supabase 연동 상태

**Cloud Agent는 실제 Supabase 계정/프로젝트를 만들 수 없고 Docker도 없다.** 그래서
이 Phase의 목표는 "실제 DB에 연결"이 아니라 "키만 넣으면 바로 붙는 code-ready
상태까지 준비"다. 현재 화면 동작(MSW mock)에는 영향이 없다.

### 현재 상태

- **마이그레이션**: `supabase/migrations/` 9개 파일 — extensions/enums → trips →
  overview(accommodations/transports) → places → expenses → checklists → wishlist
  → RLS → views. `src/mocks/fixtures/*.ts`의 Zod 스키마와 1:1로 대응한다.
  [libpg-query](https://www.npmjs.com/package/libpg-query)(실제 Postgres 파서)로
  문법만 검증했고, **실제 Supabase 프로젝트나 로컬 DB에 적용해본 적은 없다.**
- **시드**: `supabase/seed.sql` — 제주·오사카·나고야 3개 여행 + 나고야 트립의
  하위 데이터(숙소·교통편·장소·비용·체크리스트·위시리스트)를 mock 시드와 동일하게
  옮겼다. 로컬 개발용 더미 사용자를 `auth.users`에 직접 삽입한다.
- **클라이언트 코드**: `src/lib/supabase/{client,server}.ts`는 준비됐지만
  실제 프로젝트에 연결되어 있지 않다(환경변수 없으면 호출 시 런타임 에러).
- **`src/proxy.ts`** (Next.js 16의 `middleware.ts` 후신): 세션 갱신만 담당하고
  인증 경계는 아니다. `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY`가
  없으면 완전히 no-op — 이 가드 덕분에 환경변수가 없는 지금 상태에서도 앱이 전혀
  깨지지 않는다(e2e 48개로 검증 완료).
- 로그인 UI는 아직 없다.

### 실제로 연결하려면

1. Cursor Dashboard → Cloud Agents → Secrets에 `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 등록한다.
2. `supabase link` 로 실제 프로젝트와 연결한다.
3. `pnpm db:push` 로 마이그레이션을 적용한다.
4. `pnpm db:types` 로 `src/lib/supabase/database.generated.ts`를 생성한다.

### 스코프 밖 (P10-06, P10-08~11)

RPC(트랜잭션), mock → 실DB 전환, Realtime, Storage, Vercel 배포는 실제
Supabase 프로젝트 없이는 진행할 수 없어 이번 Phase에 포함하지 않았다.
