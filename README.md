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

Phase 1(프로젝트 셋업) 구현 중. `docs/08`의 Phase 단위로 하나씩 구현하고
커밋·리뷰 후 다음 Phase로 진행한다.
