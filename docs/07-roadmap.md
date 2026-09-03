# 07. 실행 로드맵 (v1 — 대체됨)

> **이 문서는 구현 계획서 v2로 대체되었다.** 실행 기준은
> [08-implementation-tasks.md](08-implementation-tasks.md)이다.
> 아래 내용은 v1 설계 당시의 단계 구분으로, 화면 구성(6탭)과 스택이 계획서 v2와
> 다르다. 개별 항목의 완료 조건은 참고 가치가 있어 남겨둔다.

각 단계는 **동작하는 상태로 끝난다.** 반쯤 만든 기능을 다음 단계로 넘기지 않는다.
단계 완료 조건에 "실기기(iOS Safari + Android Chrome) 확인"을 항상 포함한다.

## 1단계 — 부트스트랩

- [ ] Next.js 16 App Router + TypeScript strict 초기화, `src/` 구조 ([01](01-architecture.md) §1.4)
- [ ] Node/pnpm 버전 고정 (`.nvmrc`, `packageManager`)
- [ ] Emotion SSR 프로바이더 (`useServerInsertedHTML`) — FOUC 없음 확인
- [ ] 디자인 토큰 `tokens.ts` + `theme.ts` ([04](04-design-system.md) §4.2~4.4 값 그대로)
- [ ] 전역 리셋: `touch-action`, `tap-highlight`, `100dvh`, safe-area, `overscroll-behavior` (§4.7)
- [ ] 모션 토큰 CSS 변수 + `prefers-reduced-motion` 오버라이드 ([05](05-motion-and-navigation.md) §5.6)
- [ ] Pretendard 서브셋 로드
- [ ] ESLint / Prettier / `typecheck` / Vitest / Playwright(모바일 프로파일) 스크립트
- [ ] `shared/ui` 기본 컴포넌트: Button, Card, Chip, Pill, Tabs, Sheet, Skeleton
- [ ] 앱 내 뒤로가기 버튼 + 히스토리 깊이 추적 (PWA standalone 대비, §5.9)

완료 조건: 빈 랜딩 화면이 스크린샷의 배경·헤더·탭 스타일로 렌더되고, 실기기에서
탭 지연·바운스·safe-area 문제가 없다.

## 2단계 — 목 데이터로 UI 완성

- [ ] MSW 핸들러 + 나고야 3일 픽스처 (스크린샷과 동일한 데이터)
- [ ] 랜딩: 여행 카드 리스트 + 스켈레톤 + 빈 상태
- [ ] 상세 레이아웃: 헤더 + 일차 탭(미배치 배지) + 뷰 탭
- [ ] 일정 뷰: 타임라인 카드, 카테고리 칩, 금액, 도보 pill, 점선 구분선
- [ ] 후보 풀 뷰: 카테고리별 그룹, 우선순위 표시
- [ ] `?day=&view=` URL 동기화 (`replace`, `scroll: false`)

### 2-B — 전환 레이어

- [ ] 스플래시 → 랜딩 (CSS 키프레임)
- [ ] 카드 → 상세 공유 요소 모프 + `<Link>` prefetch (§5.3)
- [ ] `nav-forward` / `nav-back` 방향 슬라이드 + 헤더 고정 (§5.4)
- [ ] Suspense 리빌 (스켈레톤 → 콘텐츠)
- [ ] 일차/뷰 탭 스와이프 + 인디케이터 `layoutId` (§5.5)
- [ ] 바텀시트 드래그 dismiss + 스냅 포인트
- [ ] 누름 피드백 100ms + `useLinkStatus` 300ms 지연 스피너
- [ ] `::view-transition { pointer-events: none }`
- [ ] reduced-motion 검증 — CSS 변수 상속이 의사요소까지 닿는지 실기기 확인 (§5.6)
- [ ] 화면 왼쪽 24px 수평 드래그 차단 (iOS 스와이프 뒤로가기 충돌)

완료 조건: MSW만으로 스크린샷 3화면이 완성되고, 실기기에서 전환이 60fps로 돈다.

## 3단계 — Supabase 스키마

- [ ] Supabase 프로젝트 2개 (staging / prod) + 로컬 스택
- [ ] PostGIS 확장, enum, 테이블 전체 ([02](02-data-model.md) §2.3~2.4)
- [ ] 인덱스 (gist, 부분 인덱스 포함)
- [ ] `is_trip_member` + RLS 정책 전체 + 소유자 자동 등록 트리거 (§2.7)
- [ ] 집계 View 3개 (`security_invoker = on` 필수) (§2.6)
- [ ] RPC: `resize_trip_days`, `move_items_to_day`, `reorder_item`, `unassign_items`, `nearby_places` (§2.5)
- [ ] Realtime publication 등록 (§2.8)
- [ ] `touch_updated_at` 트리거
- [ ] `seed.sql` = 2단계 MSW 픽스처와 동일 데이터
- [ ] 타입 생성 + 커밋, CI에서 불일치 검증

완료 조건: 로컬 Studio에서 시드 데이터가 보이고, 다른 사용자 계정으로는 조회되지
않는 것(RLS)을 실제로 확인.

## 4단계 — 데이터 레이어

- [ ] Supabase 클라이언트 2종 (브라우저 / 서버), `proxy.ts` 세션 갱신 ([03](03-environments.md) §3.6)
- [ ] QueryClient 기본 설정 + 쿼리키 규약
- [ ] feature별 Zod 스키마 + DB 생성 타입 대조 (§2.10)
- [ ] Server Component prefetch → `HydrationBoundary` 하이드레이션 (§1.2)
- [ ] 낙관적 업데이트 표준 패턴 (스냅샷 → 롤백 → 토스트)
- [ ] `trip_id` 단일 채널 Realtime 구독 + 자기 이벤트 필터링 (§1.6)
- [ ] MSW ↔ 실 DB 전환 스위치 (`NEXT_PUBLIC_ENABLE_MSW`)

## 5단계 — 여행 CRUD

- [ ] 여행 생성 (제목, 목적지, 기간, 통화, 인원)
- [ ] `resize_trip_days` 연동 — 기간 변경 시 DAY 자동 생성/회수
- [ ] 카드 수정·삭제, 커버 이미지 업로드 (Supabase Storage)
- [ ] 랜딩 카드에 요약 표시 (기간, 장소 수, 예상 비용)

## 6단계 — 장소 후보 풀

- [ ] 장소 추가 시트: 이름, 카테고리, 우선순위, 예상비용, 체류시간, 영업시간, 메모
- [ ] 지오코딩 Route Handler (Nominatim 프록시, User-Agent·레이트리밋 준수)
- [ ] 좌표 실패 시 지도에서 핀 찍기
- [ ] **지도 링크 붙여넣기 파싱** ([06](06-features-and-algorithms.md) §6.9 1순위)
- [ ] 카테고리 필터, 검색, 우선순위 정렬

## 7단계 — 배치 (DnD + 멀티셀렉트)

- [ ] dnd-kit `TouchSensor`(200ms/8px) + 키보드 센서
- [ ] 같은 DAY 재정렬 → `reorder_item` (fractional index)
- [ ] 다른 DAY 이동 / 후보 풀 되돌리기
- [ ] 멀티셀렉트 모드 + 바텀시트 일괄 액션 → `move_items_to_day`
- [ ] 자동 스크롤 존, 드래그 중 스타일, 삭제 collapse 애니메이션
- [ ] 시간 입력·자동 배치 (체류시간 기반)
- [ ] `aria-live` 선택 개수 알림

완료 조건: 실기기에서 스크롤과 드래그가 충돌하지 않고, 오프라인 상태에서 이동을
시도했을 때 롤백 + 토스트가 정상 동작한다.

## 8단계 — 지도 뷰

- [ ] MapLibre 래퍼 (`next/dynamic`, 랜딩 번들 제외)
- [ ] 번호 마커 + 일차별 색상, 미배치는 회색 핀
- [ ] 경로선(polyline), 마커 탭 → 카드로 스크롤
- [ ] `방문 순서` 리스트 (지도와 1:1 대응, 접근성 대체 경로)
- [ ] 뷰 탭 왕복 시 인스턴스 유지 (재초기화 금지)
- [ ] 지도 앱 딥링크 (`geo:` / Apple Maps / Google Maps)

## 9단계 — 이동시간 자동 계산

- [ ] 하버사인 + 우회계수 추정 (`source='estimate'`, pill에 `~` 표기)
- [ ] `/api/route/estimate` Route Handler + `route_cache` 조회·기록
- [ ] OSRM 연동 (`ROUTING_PROVIDER=osrm`), matrix 엔드포인트로 N×N 일괄
- [ ] 사용자 수동 수정 (`source='manual'`은 자동 갱신에서 제외)
- [ ] 구간 프리셋 (자주 쓰는 교통 요금 저장·자동완성)

## 10단계 — 비용 뷰

- [ ] 총비용 카드, 카테고리 파이차트(+직접 라벨, 흰 stroke), 일자별 내역
- [ ] 배치 시 `est_cost` → `expenses` 자동 생성 (`is_manual` 보호)
- [ ] 예상 vs 실제 비교, 예산 게이지, 1인당 금액
- [ ] 환율 스냅샷 + 원화 병기 (`/api/fx`)

## 11단계 — 제안 엔진

- [ ] `suggest_day_clusters` RPC (경도 `cos(lat)` 보정 필수)
- [ ] DBSCAN 1패스로 외곽 분리 → k-means 2패스
- [ ] 순서 최적화: n≤12 Held-Karp / n>12 NN+2-opt
- [ ] 식사·카페 삽입 규칙, 숙소 시작/종료 고정, `locked` 항목 존중
- [ ] 제안 미리보기 카드 + 수락/무시 (자동 적용 금지)
- [ ] 경고 검사 7종 + 노란 배지 (§6.7)

## 12단계 — 인증·배포

- [ ] Supabase Auth (이메일 매직링크 + 소셜 1종)
- [ ] 로그인/콜백 화면, `proxy.ts` 보호 경로
- [ ] `/share/[token]` 읽기 전용 (service role 검증, RLS 개방 금지)
- [ ] Vercel 배포 (리전 `icn1`), 환경변수 3스코프
- [ ] PWA manifest + 아이콘 + iOS 스플래시
- [ ] Lighthouse CI 성능 예산 게이트 ([01](01-architecture.md) §1.8)

## 13단계 — 확장

- [ ] Today 모드 (다음 일정, 지연 반영, 근처 후보)
- [ ] 예약 뷰 (항공·숙소·기차)
- [ ] 날씨 연동 + 우천 대안 제안
- [ ] 장소 라이브러리 (여행 간 재사용), 여행 복제
- [ ] 오프라인: Query 영속화 + 뮤테이션 큐 (모든 뮤테이션 멱등 전제)
- [ ] 회고 모드 (사진, 실제 지출, 별점)

## 시작 전 확정 필요

| # | 항목 | 기본값 (미응답 시) |
| --- | --- | --- |
| 1 | Emotion 유지 vs vanilla-extract | Emotion 유지 (룰 준수). 화면 대부분이 Client Component가 됨 |
| 2 | 로그인 1단계 포함 여부 | 12단계로 미룸. 단, `trip_members`·RLS는 3단계에서 미리 구성 |
| 3 | 동행자 공동 편집 | 스키마만 준비, 기능은 13단계 |
| 4 | 라우팅 API 예산 | `ROUTING_PROVIDER=estimate`로 무료 시작 |
| 5 | 장소 검색 소스 | Nominatim + 지도 링크 붙여넣기 |
| 6 | 전환 강도 | 하이브리드 (라우트 2개 + 내부는 클라이언트 전환) |
| 7 | PWA standalone | 12단계에서 적용. 뒤로가기 구조는 1단계부터 반영 |
