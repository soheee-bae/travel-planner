# DESIGN.md — 여행 플래너

**결정**: Notion 스타일(웜 미니멀리즘·serif 헤딩·soft surface) 채택 (`docs/09-open-decisions.md` D10).
색상 토큰은 여러 Notion 디자인 시스템 분석 자료(DesignMD, Duply, webdesignhot)를 대조해
공통으로 나오는 값을 채용했다. 카테고리 칩 팔레트는 사용자가 첨부한 스크린샷에서
픽셀 단위로 직접 추출한 값을 그대로 재사용한다(`docs/04-design-system.md` §4.2).

이 문서는 `src/app/globals.css`의 Tailwind v4 `@theme` 토큰과 1:1로 대응한다.
값이 바뀌면 두 곳을 같이 수정한다.

## 원칙

1. **그림자를 쓰지 않는다.** 카드는 보더로만 구분한다. 그림자는 바텀시트·모달·FAB
   처럼 실제로 떠 있는 것에만 쓴다.
2. **배경은 페이지가, 표면은 카드가 담당한다.** 페이지 `bg-background`(웜 오프화이트)
   위에 카드 `bg-card`(순백)를 놓는 것만으로 카드가 뜬 것처럼 보인다.
3. **세리프는 "가끔"이다.** Notion도 세리프를 큰 섹션 타이틀에만 쓰고 본문·UI는
   전부 산세리프다. 카드 제목·버튼·탭 라벨·본문은 절대 세리프를 쓰지 않는다.
4. **색은 의미만 전달한다.** 카테고리 구분은 색 + 텍스트 라벨을 항상 함께 쓴다.
5. **`!important`를 쓰지 않는다.** Tailwind 유틸리티 우선순위와 컴포넌트 합성으로
   해결한다.

## 색상 토큰

### 표면·텍스트 (Notion 실측값 기반)

| 토큰 (Tailwind 클래스) | 값 | 대비 검증 | 용도 |
| --- | --- | --- | --- |
| `bg-background` | `#F6F5F4` | — | 페이지 배경. Notion의 웜 오프화이트 |
| `bg-card` / `bg-popover` | `#FFFFFF` | — | 카드, 헤더, 시트, 팝오버 |
| `text-foreground` | `#191919` | 17.58:1 on 카드 | 제목, 본문 |
| `text-muted-foreground` | `#615D59` | 6.53:1 on 카드 / 5.99:1 on 배경 | 메타, 설명, 비활성 |
| `bg-muted` / `bg-secondary` | `#F0EFED` | — | 중립 표면, 비활성 배지 |
| `border-border` / `border-input` | `#DFDCD9` | — | 카드 보더 (1px) |

### 강조 (Notion 액션 블루)

| 토큰 | 값 | 대비 | 용도 |
| --- | --- | --- | --- |
| `bg-primary` / `text-primary` / `ring-ring` | `#0075DE` | 4.57:1 on 흰 배경 (경계) | 활성 탭, 링크, 주요 버튼 |
| `text-primary-foreground` | `#FFFFFF` | 4.57:1 on `#0075DE` | 버튼 위 텍스트 |
| `--primary-hover`(제안) | `#005BAB` | 5.52:1 | 눌린 상태 |
| `bg-accent` | `#E6F3FE` | — | 강조 배경 (Notion의 accent-soft) |

**`#0075DE`는 WCAG AA 경계값(4.57:1)이다.** 15px 이상 + 500 굵기 이상에서만
텍스트로 쓴다. 더 작은 텍스트에는 쓰지 않는다.

### 의미 색상 (Notion 팔레트 밖, 별도 도입)

| 토큰 | 값 | 대비 | 용도 |
| --- | --- | --- | --- |
| `text-money` / `bg-money` | `#2E7D57` | 5.02:1 on 흰 배경 | 금액 텍스트 |
| `bg-money-surface` | `#F1F8F4` | — | 총비용 카드 배경 |
| `text-destructive` / `bg-destructive` | `#C63F39` | 5.03:1 (흰 글자 기준) | 삭제, 미배정 배지, 경고 |

두 값 모두 스크린샷 실측값(`#43946C` 3.69:1, `#DD524C` 3.9:1)이 WCAG AA(4.5:1)
미달이라 조정한 것이다(`docs/04-design-system.md` §4.2).

### 카테고리 팔레트 (스크린샷 실측값 재사용)

| 카테고리 | 칩 배경 | 칩 텍스트 | 차트 fill |
| --- | --- | --- | --- |
| 관광 `sight` | `#F3E9FE` | `#6B2FBF` | `#9D5AEF` (`chart-1`) |
| 교통 `transport` | `#E9F0FE` | `#1F4FC4` | `#4E81EE` (`chart-2`) |
| 식사 `food` | `#E2FBE9` | `#2E7D57` | `#5EC26A` (`chart-3`) |
| 이동 `move` | `#F0EFED` | `#191919` | `#6D727F` (`chart-4`) |
| 쇼핑 `shop` | `#F9E8F3` | `#90264D` | `#C2568F` (`chart-5`) |
| 카페 `cafe` | `#FDF2E3` | `#8A5A16` | `#DA9B35` |
| 숙소 `stay` | `#E6F5F7` | `#0E7490` | `#0E7490` |

전부 AA 이상(4.59~9.33:1)이다. 파이차트에서 fill끼리의 대비가 낮으므로(관광·쇼핑
1.02:1) 슬라이스 사이 흰 stroke 2px + 직접 라벨을 함께 쓴다(Phase 7, P7-02).

## 타이포그래피

| 역할 | 폰트 | 굵기 | 용도 |
| --- | --- | --- | --- |
| 본문·UI (`font-sans`) | Noto Sans KR | 400/500/600/700 | 카드, 버튼, 탭, 본문 전부 |
| 헤딩 (`font-serif`) | Noto Serif KR | 400/600 | 페이지 타이틀, 대형 섹션 헤딩만 |

**세리프 적용 범위를 의도적으로 좁게 잡는다.** 랜딩 타이틀(`나의 여행`)과 여행
디테일 헤더의 여행 이름 정도. 카드 제목, 탭 라벨, 버튼, 본문은 전부 `font-sans`다.

Pretendard(v1 설계 당시 선택)가 아니라 Noto Sans KR을 쓰는 이유: Pretendard는
Google Fonts에 없어 별도 정적 폰트 파일을 리포에 넣어야 한다(바이너리 커밋 지양).
Noto Sans KR은 `next/font/google`로 빌드 시점에 자체 호스팅되어 런타임 CDN
요청이 없고, 라이선스·서브셋팅이 자동 처리된다. 이후 Pretendard로 바꾸고 싶으면
`next/font/local`로 교체하는 정도의 변경이다.

## 라운딩·그림자

shadcn 기본 스케일(`--radius` 기준 비율)을 그대로 쓰되 기준값만 조정했다.

| Tailwind 유틸 | 계산값 | 실제 px (`--radius: 0.75rem`) | 용도 |
| --- | --- | --- | --- |
| `rounded-md` | `0.8 × --radius` | ~9.6px | 칩, 작은 버튼 |
| `rounded-lg` | `1 × --radius` | 12px | 카드 (기본) |
| `rounded-xl` | `1.4 × --radius` | ~16.8px | 바텀시트 상단, 패널 |
| `rounded-full` | — | pill | pill, 순번 원, 개수 배지 |

그림자 토큰은 카드에 없다(원칙 1). 바텀시트·FAB용 그림자는 Phase 6에서 정의한다.

## 컴포넌트 조정 필요 사항 (Phase 2+에서 처리)

- **shadcn 기본 `Button`의 `default` 높이는 32px(`h-8`)**다. 모바일 44×44px
  터치 타겟 기준에 못 미친다. 주요 CTA에는 `size="lg"`를 44px로 재정의하거나
  모바일 전용 size(`size="mobile"`)를 추가한다. Phase 2에서 실제 버튼을 만들
  때 처리한다.
- shadcn 컴포넌트를 추가할 때(`pnpm dlx shadcn@latest add <name>`)마다 색상이
  위 토큰을 참조하는지 확인한다. 컴포넌트 소스가 직접 hex를 하드코딩하는 경우는
  없지만, 커스터마이즈 시 하드코딩하지 않도록 주의한다.

## 다크모드

v1 범위에서 제외한다(`docs/09` D7). `globals.css`의 `.dark` 블록은 shadcn 기본값을
그대로 남겨두되 실제로 토글하는 UI는 만들지 않는다. 토큰이 이미 semantic하게
분리되어 있어 나중에 `.dark`의 값만 교체하면 켤 수 있다.
