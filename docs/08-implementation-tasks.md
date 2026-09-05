# 08. 구현 태스크 분해 (계획서 v2 기준)

**기준 문서**: 사용자 제공 `구현 계획서 v2`. 이 문서가 스택·화면 구성·구현 순서의
최종 근거이며, `docs/01`~`07`(v1 설계)은 참고 자료로 강등된다.

> 계획서 v2 원문은 아직 레포에 없다. `docs/plan-v2.md`로 커밋해두면 이 문서에서
> 섹션을 정확히 참조할 수 있다.

**선결 조건**: [09-open-decisions.md](09-open-decisions.md)의 D1·D2·D10이 확정되기
전에는 Phase 1을 시작할 수 없다. 이 셋은 모든 UI 티켓의 형태를 바꾼다.

## 8.1 계획서 v2 확정 사항 요약

| 항목 | 값 |
| --- | --- |
| 컨테이너 | `max-w-md` (448px) 중앙 정렬 + 하단 네비게이션 바 |
| 화면 구성 | 스플래시 → 랜딩 → 생성 → 디테일(6탭) |
| 6탭 | 개요 / 플래너 / 리스트 / 비용 / 준비 / 위시리스트 |
| 플래너 | **지도 + 일정 통합.** 전체화면 지도 + 드래그 바텀시트 |
| 장소 배정 | ① 지도 마커 탭 ② 리스트 멀티셀렉트 ③ 자동 배치(클러스터링) |
| 스택 | Next.js + Tailwind + shadcn/ui + Framer Motion + Supabase + Vercel |
| 지도 | Naver(한국) / Google(해외), 국가코드로 분기 |
| 환율 | Frankfurter.app |
| 순서 | UI + mock 우선(Phase 1~9), Supabase 연동은 Phase 10 |
| 테이블 | trips, trip_days, places, accommodations, transports, expenses, checklists, checklist_items, wishlists |

## 8.2 태스크 규약

| 항목 | 규칙 |
| --- | --- |
| ID | `P<페이즈>-<번호>`. 브랜치·커밋 메시지에 포함 |
| 브랜치 | `cursor/p1-02-tailwind-shadcn-5a9c` |
| 크기 | `S` 파일 1~3개 / `M` 4~10개 / `L` 10개 초과 또는 스키마 변경 동반 |
| DoD | 각 티켓 완료 조건 + §8.13 공통 DoD 전부 |
| 실기기 | UI 티켓은 iOS Safari + Android Chrome 확인 필수 |
| `∥` | 서로 의존이 없어 동시 진행 가능 |

---

## Phase 1 — 프로젝트 셋업

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| P1-01 | Next.js 초기화 | `package.json`, `next.config.ts`, `tsconfig.json`, `.nvmrc` | strict 모드 `tsc --noEmit` 통과, `pnpm dev` 기동 | D3 | S |
| P1-02 | Tailwind + shadcn/ui | `globals.css`, `components.json`, `components/ui/*` | Button·Card·Sheet·Tabs·Input 설치 후 렌더 확인 | P1-01, D1 | M |
| P1-03 | DESIGN.md 토큰화 | `DESIGN.md`, Tailwind `@theme` 토큰 | 색·타이포·라운딩·그림자를 semantic 토큰으로. 하드코딩 hex 0건 | P1-02, D10 | L |
| P1-04 | 앱 셸 | `app/layout.tsx`, `components/layout/AppShell.tsx` | `max-w-md` 중앙, 데스크톱 배경, `100dvh` | P1-03 | M |
| P1-05 | 하단 네비게이션 | `components/layout/BottomNav.tsx` | 44px 터치 타겟, safe-area, 활성 표시, `aria-current` | P1-04 | M |
| P1-06 | 모바일 전역 리셋 | `globals.css` | `touch-action: manipulation`, tap-highlight 제거, `overscroll-behavior`, safe-area | P1-02 | S |
| P1-07 | Framer Motion 셋업 | `lib/motion.ts` | duration·easing·spring 토큰 상수화. `prefers-reduced-motion` 훅 | P1-01 | S |
| P1-08 | 데이터 레이어 스캐폴드 | `lib/query.ts` + `mocks/*` (또는 `store/*`) | **D2 결정에 따라 형태가 갈린다.** mock으로 CRUD 왕복이 동작 | D2 | M |
| P1-09 ∥ | 툴체인 | ESLint, Prettier, Vitest, Playwright(모바일 프로파일) | `pnpm lint/test/typecheck` 통과 | P1-01 | S |
| P1-10 ∥ | CI | `.github/workflows/ci.yml` | PR에서 typecheck·lint·test·build | P1-09 | S |

**Phase 1 완료 조건**: 빈 셸이 데스크톱에서 모바일 앱처럼 중앙 정렬되고, 실기기에서
탭 지연·주소창 높이 점프·safe-area 침범이 없다.

---

## Phase 2 — 스플래시 + 랜딩

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| P2-01 | mock 데이터 | `mocks/fixtures/trips.ts` | 제주·오사카 + 나고야(스크린샷 재현용) 3건. 전 필드 채움 | P1-08 | M |
| P2-02 | 스플래시 | `components/Splash.tsx` | 로고 + 비행기 애니메이션 → fade out. **라우트 아님** (D9 참조) | P1-07 | S |
| P2-03 | TripCard | `components/trips/TripCard.tsx` | 커버·여행지·기간·동행자. 누름 피드백 100ms 이내 | P1-03 | M |
| P2-04 | 랜딩 | `app/trips/page.tsx` | 카드 리스트 + 스켈레톤(높이 일치) + 빈 상태 | P2-03, P2-01 | M |
| P2-05 | 여행 추가 FAB | `components/trips/AddTripFab.tsx` | 하단 플로팅, `aria-label`, safe-area 고려 | P2-04 | S |
| P2-06 | 카드 → 디테일 전환 | Framer Motion 또는 View Transitions | 카드가 헤더로 이어지는 전환. reduced-motion에서 즉시 | P2-04, D3 | M |

---

## Phase 3 — 여행 생성

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| P3-01 | 생성 폼 | `app/trips/new/page.tsx`, `CreateTripForm.tsx` | RHF + Zod. 여행지·국가·박수·날짜·동행자·커버·통화 | P1-08 | L |
| P3-02 | 날짜 범위 피커 | `components/ui/DateRangePicker.tsx` | 모바일 터치 캘린더. 박수 ↔ 날짜 양방향 동기화 | P3-01 | L |
| P3-03 | 국가 → 지도 제공자 | `lib/map-provider.ts` | 국가코드로 Naver/Google 결정. 순수 함수 + 단위 테스트 | P3-01 | S |
| P3-04 | trip_days 생성 | `lib/trip-days.ts` | 박수 변경 시 Day 추가/삭제. **삭제되는 Day의 장소는 미배정으로 회수** | P3-01 | M |
| P3-05 | 커버 이미지 | 업로드 + 기본 이미지 세트 | 리사이즈 후 저장. 미선택 시 목적지별 기본 이미지 | P3-01 | M |
| P3-06 | 동행자 태그 | 태그 선택 + 직접 입력 | 혼자/커플/친구/가족 + 커스텀 | P3-01 | S |

**P3-04의 회수 규칙이 중요하다.** 3박 4일을 2박 3일로 줄였을 때 Day 4 장소가
삭제되면 사용자가 모아둔 데이터가 사라진다. 미배정으로 되돌린다.

---

## Phase 4 — 여행 디테일 + 개요 탭

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| P4-01 | TripHeader | `components/TripHeader.tsx` | 뒤로가기·제목·편집. 기간·동행자 요약행 | P1-04 | S |
| P4-02 | 6탭 네비게이션 | `components/TabNavigation.tsx` | 448px에 6탭. **라벨 축약 + 가로 스크롤** (D6) | P4-01, D6 | M |
| P4-03 | 탭 URL 동기화 | `hooks/useTripTab.ts` | `?tab=planner`. `replace` + `scroll:false`. 딥링크·뒤로가기 동작 | P4-02 | M |
| P4-04 | 탭 전환 애니메이션 | Framer Motion 수평 슬라이드 | 스와이프 제스처. **왼쪽 24px 게이팅**(iOS 뒤로가기 충돌) | P4-03 | L |
| P4-05 | 숙소 CRUD | `components/overview/AccommodationCard.tsx` + 시트 | 7필드. 체크인/아웃 날짜+시간, 예약번호, 비용 | P1-08 | M |
| P4-06 | 교통편 CRUD | `components/overview/TransportCard.tsx` + 시트 | 유형 5종, 출발/도착, 편명, 비용 | P1-08 | M |
| P4-07 | 개요 요약 | `components/overview/SummaryStats.tsx` | 총 장소 수(카테고리별), 예상 비용, 미배정 개수 | P4-05, P4-06 | M |

---

## Phase 5 — 리스트 탭 (장소 관리)

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| P5-01 | 장소 타입·스키마 | `lib/schemas/place.ts` | 계획서 17개 property 전부. Zod → 타입 파생 | P1-08 | M |
| P5-02 | 장소 추가 시트 | `components/places/AddPlaceModal.tsx` | 필수(이름·카테고리) 먼저, 나머지는 접힘. 입력 마찰 최소화 | P5-01 | L |
| P5-03 | PlaceCard | `components/places/PlaceCard.tsx` | Day 배정 배지 / `미정`, 우선순위 ⭐, 위치, 비용 | P5-01 | M |
| P5-04 | 카테고리 그룹·필터 | `PlaceFilterBar.tsx` + 그룹 리스트 | 전체/관광/맛집/카페/쇼핑/액티비티. 개수 표시 | P5-03 | M |
| P5-05 | 지오코딩 | `app/api/geocode/route.ts` | 주소 → 좌표 자동. 실패 시 지도에서 핀 찍기 폴백 | P3-03 | M |
| P5-06 | 지도 링크 파싱 | `app/api/geocode/parse/route.ts` | 네이버·구글 지도 공유 URL → 이름+좌표. **입력 마찰 최대 감소 지점** | P5-05 | L |
| P5-07 | 멀티셀렉트 → Day 이동 | `components/places/SelectionBar.tsx` | 롱프레스 진입, 일괄 배정, `aria-live` 개수 알림 | P5-03 | L |
| P5-08 | 사진·태그 | 첨부 + 자유 태그 | 사진 리사이즈. 태그 자동완성 | P5-02 | M |

**P5-06을 Phase 5에서 가장 높게 평가한다.** 이 앱의 실제 병목은 계획을 짜는 게
아니라 장소를 수십 개 입력하는 것이다. URL 하나 붙여서 끝나야 한다.

---

## Phase 6 — 플래너 탭 (최대 난이도)

**이 페이즈에 프로젝트 리스크가 집중된다.** 지도 팬/줌, 바텀시트 드래그, 카드 DnD가
모두 같은 터치 이벤트를 두고 경쟁한다. 그래서 **제스처 스파이크를 최우선으로 둔다.**

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| **P6-00** | **제스처 중재 스파이크** | 버리는 프로토타입 | 지도 팬 · 시트 드래그 · 카드 DnD 3중 충돌 해소 방식 확정. **문서로 결론 남김** | P1-07, D5 | L |
| P6-01 | 지도 어댑터 인터페이스 | `components/maps/MapProvider.ts` | 마커·폴리라인·줌·이벤트 추상화. 제공자 교체가 이 파일 밖으로 새지 않음 | D4 | M |
| P6-02 | 지도 구현 #1 | `GoogleMapViewer.tsx` 또는 `NaverMap.tsx` | 어댑터 준수. **D4에 따라 어느 쪽이 먼저인지 결정** | P6-01 | L |
| P6-03 | 지도 구현 #2 | 나머지 제공자 | 어댑터 준수. 동일 테스트 통과 | P6-02 | L |
| P6-04 | 마커 레이어 | `components/maps/MarkerLayer.tsx` | 배정=파랑+번호 / 미배정=회색 / 선택=노랑 | P6-02 | M |
| P6-05 | 경로 폴리라인 | `RouteLine.tsx` | 순서 변경 시 자동 갱신 | P6-04 | M |
| P6-06 | 바텀시트 | `components/maps/BottomSheet.tsx` | 스냅 3점(peek/half/full). **핸들 영역에서만 드래그 수신** | P6-00 | L |
| P6-07 | Day 탭 + 전체 탭 | `PlannerDayTabs.tsx` | 탭 전환 시 해당 Day로 줌/패닝. 전체는 Day별 색상 구분 | P6-04 | M |
| P6-08 | 마커 탭 → Day 배정 | 배정 팝업 | "Day N에 추가" 선택 → 즉시 마커 색 변경 | P6-04 | M |
| P6-09 | 카드 DnD | dnd-kit + `TouchSensor{delay:200,tolerance:8}` | 순서 변경 → 폴리라인 즉시 갱신. **순서는 fractional index**(D8) | P6-06, P6-00 | L |
| P6-10 | 이동시간 계산 | `app/api/directions/route.ts` + 캐시 | 카드 사이 `🚗 30분` / `🚶 5분`. 추정값은 `~` 표기로 구분 | P6-09 | L |
| P6-11 | 자동 배치 | `lib/clustering.ts` + 제안 UI | **경도 `cos(위도)` 보정 필수.** 제안 → 수락, 자동 적용 금지 | P6-07 | L |
| P6-12 | 순서 최적화 | `lib/route-optimizer.ts` | n≤12 정확해(Held-Karp) / n>12 NN+2-opt. 단위 테스트 | P6-10, P6-11 | L |

**P6-00을 건너뛰면 P6-06과 P6-09에서 반드시 되돌아온다.** 시트를 위로 드래그하려는
동작과 지도를 아래로 패닝하려는 동작은 좌표만으로 구분되지 않고, 시트 안의 카드를
집으려는 롱프레스는 시트 드래그와 겹친다. 중재 규칙을 먼저 정하고 나서 만든다.

`P6-11`의 좌표 보정: 위경도를 그대로 클러스터링하면 안 된다. 위도 35°(오사카·나고야)
에서 경도 1°는 위도 1°의 약 0.82배 거리라서, 보정 없이 k-means를 돌리면 동서로
부당하게 뭉친다. 경도에 `cos(중심위도)`를 곱하면 도시 규모에서 충분히 정확하다.

---

## Phase 7 — 비용 탭

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| P7-01 | 비용 CRUD | `AddExpenseModal.tsx`, `ExpenseCard.tsx` | 계획서 11개 property. 카테고리 9종 | P1-08 | M |
| P7-02 | 도넛 차트 | `BudgetDonutChart.tsx` | Recharts. **흰 stroke 2px + 직접 라벨 + %** (색만으로 구분 금지) | P7-01 | M |
| P7-03 | 그룹핑 4종 | 그룹 셀렉터 | Day별 / 카테고리별 / 결제수단별 / 결제자별 | P7-01 | M |
| P7-04 | 환율 | `app/api/currency/route.ts` | Frankfurter. 일 1회 캐시. 여행 생성 시 스냅샷 | P7-01 | M |
| P7-05 | 장소 연결 자동 집계 | `place_id` 연결 | 장소의 `estimated_cost` → 비용 자동 생성. **사용자 수정 보호 플래그 필수** | P7-01, P5-01 | M |
| P7-06 | 더치페이 정산 | 결제자별 요약 | 누가 얼마 냈고 1인당 얼마인지 | P7-03 | M |

**P7-05의 보호 플래그**: 자동 생성한 금액을 사용자가 고친 뒤 다시 자동으로 덮어쓰는
것이 이런 기능에서 가장 흔한 버그다. `is_manual` 한 칸으로 막는다.

---

## Phase 8 — 준비 탭

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| P8-01 | 체크리스트 스키마 | `lib/schemas/checklist.ts` | 카테고리 + 항목 2계층 | P1-08 | S |
| P8-02 | 기본 카테고리 시드 | `lib/checklist-presets.ts` | 여행 생성 시 5종 자동 생성(예약/서류/디지털/금융/패킹) | P8-01, P3-01 | M |
| P8-03 | 체크리스트 CRUD | `ChecklistCategory.tsx`, `ChecklistItem.tsx` | 체크 토글 즉시 반영, 프로그레스 바 | P8-01 | M |
| P8-04 | 카테고리 커스터마이즈 | 추가·이름변경·삭제 + 순서 DnD | 사용자 정의 카테고리 | P8-03 | M |
| P8-05 | 추천 카테고리 | `[쇼핑리스트][선물리스트]...` 버튼 | 원터치로 프리셋 카테고리 추가 | P8-04 | S |

---

## Phase 9 — 위시리스트 탭

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| P9-01 | 메모 CRUD | `WishlistCard.tsx` + 편집 시트 | 제목 + 자유 텍스트 + 이모지 선택 | P1-08 | M |
| P9-02 | 순서 변경 | dnd-kit | Phase 6의 DnD 설정 재사용 | P9-01, P6-09 | S |

---

## Phase 10 — Supabase 연동

| ID | 태스크 | 산출물 | 완료 조건 | 의존 | 크기 |
| --- | --- | --- | --- | --- | --- |
| P10-01 | 프로젝트 + 로컬 스택 | `supabase/config.toml` | staging/prod 분리. `supabase start` 동작 | — | S |
| P10-02 | 마이그레이션 | `migrations/0001~` | 9개 테이블. 참조 순서 준수 | P10-01 | L |
| P10-03 | 인덱스 + 순서 컬럼 | `migrations/` | `order_index`를 fractional 타입으로(D8). 좌표 인덱스 | P10-02 | M |
| P10-04 | RLS | `migrations/` | 단일 관문 함수 + 전 테이블 정책. **다른 계정에서 0행 확인** | P10-02 | L |
| P10-05 | 집계 View | `migrations/` | 비용 합계·비율·Day 소계. `security_invoker = on` | P10-04 | M |
| P10-06 | RPC | `migrations/` | Day 재생성, 일괄 Day 이동, 순서 재정렬 (트랜잭션) | P10-04 | L |
| P10-07 | Auth | 로그인·콜백 | 매직링크 + 소셜 1종 | P10-04 | M |
| P10-08 | mock → 실 DB 전환 | 데이터 레이어 교체 | **D2 결정에 따라 난이도가 극적으로 다르다** | P10-06, P1-08 | M~L |
| P10-09 | Realtime | 구독 훅 | `trip_id` 단일 채널. 자기 이벤트 필터링 | P10-08 | M |
| P10-10 | Storage | 커버·장소 사진 | 업로드 정책. `next/image` 도메인 허용 | P10-08 | M |
| P10-11 | 배포 | Vercel | 리전 `icn1`. 환경변수 3스코프 | P10-08 | S |

---

## 8.3 임계 경로

```
D1·D2·D10 결정 ─► P1-02 ─► P1-03 ─► P1-04 ─► P4-02 ─► P4-03
                                                  │
                          P6-00 (제스처 스파이크) ─┴─► P6-06 ─► P6-09 ─► P6-10 ─► P6-12
                                                  │
                                        P6-01 ─► P6-02 ─► P6-04 ─► P6-07 ─► P6-11
```

병목은 셋이다.

1. **결정 대기** — D1(Tailwind vs Emotion)이 안 정해지면 P1-02부터 막힌다.
2. **P6-00 제스처 스파이크** — 여기 결론이 P6-06·P6-09의 구조를 정한다. 나중에
   발견하면 플래너 탭을 다시 만든다.
3. **P6-02/P6-03 지도 이중 구현** — 제공자 2개를 다 만들면 Phase 6의 작업량이
   거의 두 배가 된다. D4에서 범위를 좁히는 것이 가장 효과적인 리스크 감축이다.

## 8.4 계획서 순서에 대한 조정 제안

계획서의 Phase 순서를 대체로 따르되 **두 가지만 앞으로 당기자고 제안한다.**

| 제안 | 이유 |
| --- | --- |
| `P6-00` 제스처 스파이크를 **Phase 4 직후**로 | 플래너가 6번째에 있어서 최대 리스크가 가장 늦게 드러난다. 스파이크만 먼저 해서 구조를 확정하면 P5 진행 중에도 안전하다 |
| `P10-04` RLS 스키마 설계를 **Phase 2 시점에 문서로만** | Auth 없이 만든 테이블에 나중에 RLS를 얹으면 전 테이블 정책을 새로 쓴다. 구현은 Phase 10이어도 `owner_id`와 소유권 모델은 mock 타입에 미리 반영 |

## 8.5 공통 DoD

- [ ] `pnpm build && pnpm lint && pnpm typecheck` 통과
- [ ] `any` 미사용 (불가피하면 `unknown` + 타입 가드)
- [ ] 서버 상태를 로컬 `useState`로 복사하지 않음
- [ ] 인터랙티브 요소에 `aria` 속성 + 44×44px 터치 타겟
- [ ] 색만으로 정보를 전달하는 곳 없음 (라벨·패턴 병행)
- [ ] `prefers-reduced-motion` 대응
- [ ] UI 변경 시 실기기 2종(iOS Safari, Android Chrome) 확인
- [ ] DnD·시트·지도를 건드리면 제스처 충돌 회귀 확인
- [ ] 뮤테이션 추가 시 낙관적 반영 + 실패 롤백
