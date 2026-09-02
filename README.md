# travel-planner

모바일 우선(mobile-first) 여행 플래너 웹앱.

관광지·맛집·카페를 먼저 **후보 풀**에 모아두고, 여행 당일 또는 계획 단계에서
위치가 가까운 것끼리 **DAY 단위로 배치**하는 방식을 그대로 지원한다.
"계획적이면서 즉흥적인" 워크플로우가 데이터 모델과 UI의 1급 개념이다.

## 스택

| 영역 | 선택 | 버전 (2026-09 기준 최신) |
| --- | --- | --- |
| 프레임워크 | Next.js App Router | 16.3.4 |
| 런타임 | React | 19.2.8 |
| 언어 | TypeScript (strict) | 7.0.2 |
| 스타일 | Emotion | 11.14.0 |
| 서버 상태 | TanStack Query | 5.102.8 |
| DnD | dnd-kit core / sortable | 6.3.1 / 10.0.0 |
| 제스처·스프링 | Motion | 13.1.1 |
| 지도 | MapLibre GL JS | 6.6.0 |
| 차트 | Recharts | 3.10.1 |
| 스키마 검증 | Zod | 4.5.4 |
| 폼 | React Hook Form | 7.87.0 |
| 목 서버 | MSW | 2.15.0 |
| BaaS | Supabase (Postgres + PostGIS + Auth + Realtime) | js 2.112.4 / ssr 0.12.5 |
| 호스팅 | Vercel (앱) + Supabase (DB) | — |

## 문서

| 문서 | 내용 |
| --- | --- |
| [docs/01-architecture.md](docs/01-architecture.md) | 시스템 구성, 렌더링 전략, 폴더 구조, 라우팅, 상태 소유권 |
| [docs/02-data-model.md](docs/02-data-model.md) | 테이블 DDL, RLS, 집계 View, RPC, 인덱스 |
| [docs/03-environments.md](docs/03-environments.md) | local / preview / production, 환경변수, 마이그레이션, CI |
| [docs/04-design-system.md](docs/04-design-system.md) | 스크린샷 실측 기반 토큰, 타이포, 컴포넌트 스펙 |
| [docs/05-motion-and-navigation.md](docs/05-motion-and-navigation.md) | View Transitions 4패턴, 제스처 레이어, 접근성 |
| [docs/06-features-and-algorithms.md](docs/06-features-and-algorithms.md) | 뷰 구성, 위치 클러스터링, 순서 최적화, 이동시간·비용 자동화 |
| [docs/07-roadmap.md](docs/07-roadmap.md) | 단계별 실행 체크리스트 |

## 현재 상태

설계 문서만 존재한다. 구현 코드는 아직 없다.
[docs/07-roadmap.md](docs/07-roadmap.md)의 1단계부터 진행한다.

## 시작하기 (구현 후 사용)

```bash
pnpm install
cp .env.example .env.local   # 값 채우기
pnpm supabase start          # 로컬 Postgres + Studio (Docker 필요)
pnpm db:push                 # 마이그레이션 적용
pnpm db:types                # DB → TypeScript 타입 생성
pnpm dev
```
