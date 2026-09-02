# 05. 전환·모션·네비게이션

## 5.1 접근 방식 (이전 판단 정정)

앞서 "App Router에서 페이지 전환 애니메이션은 서드파티 래퍼(`next-view-transitions`)나
`experimental.viewTransition` 플래그가 필요하다"고 정리했는데, **현재 Next.js 공식
문서 기준으로는 틀렸다.** 실제 상태는 이렇다.

- View Transitions는 **App Router에서 별도 설정 없이 동작한다.** App Router가 React
  canary를 쓰기 때문에 `ViewTransition`이 이미 포함되어 있고, `react@canary`를
  직접 설치할 필요도 없다.
- 컴포넌트는 `react`에서 가져온다. `import { ViewTransition } from 'react'`
- `<Link>`에 `transitionTypes` prop이 있어서 **전진/후퇴 방향을 지정**할 수 있다.
  `useRouter().push()/replace()`도 같은 옵션을 받는다.
- 미지원 브라우저에서는 애니메이션만 건너뛰고 정상 동작한다. 기능 감지 분기를
  컴포넌트에 쓰지 않는다.

따라서 서드파티 전환 라이브러리를 도입하지 않는다. **Motion의 역할은 페이지 전환이
아니라 제스처와 스프링**으로 축소된다(§5.5).

> 브라우저 지원: React 통합은 transition types와 `view-transition-class`를 쓰므로
> Chromium 125+, 최신 Safari·Firefox가 필요하다. Safari에서 일부 애니메이션이
> 다르게 동작할 수 있다. 주 타겟(iOS Safari / Android Chrome)은 커버되지만,
> **정확한 최소 버전은 배포 전에 caniuse로 다시 확인한다.**

## 5.2 전환 지도

| 전환 | 방식 | 의미 |
| --- | --- | --- |
| 스플래시 → 랜딩 | CSS 키프레임 (로고 scale + fade) | 앱 시작 |
| 여행 카드 → 상세 | ViewTransition 공유 요소 모프 | "같은 것, 더 깊이" |
| 상세 → 랜딩 (앱 내 버튼) | ViewTransition `nav-back` 슬라이드 | "돌아왔다" |
| 스켈레톤 → 콘텐츠 | ViewTransition Suspense 리빌 | "데이터 도착" |
| 일차 탭 (1일차↔2일차) | Motion 수평 슬라이드 + 스와이프 | "같은 화면, 다른 날" |
| 뷰 탭 (일정↔지도↔비용) | Motion 수평 슬라이드 + 스와이프 | "같은 날, 다른 관점" |
| 바텀시트 | Motion 스프링 + 드래그 dismiss | "임시 작업" |
| 카드 재정렬·삭제 | dnd-kit + FLIP, 높이 collapse | "구조가 바뀜" |

## 5.3 패턴 1 — 여행 카드가 상세로 펼쳐지기

랜딩의 카드와 상세의 헤더에 **같은 `name`**을 준다.

```
랜딩 page.tsx (Server)
  <Link href={`/trips/${trip.id}`} transitionTypes={['nav-forward']}>
    <ViewTransition name={`trip-cover-${trip.id}`} share="morph" default="none">
      <TripCard ... />
    </ViewTransition>
  </Link>

상세 page.tsx (Server)
  <ViewTransition name={`trip-cover-${trip.id}`} share="morph" default="none">
    <TripHeader ... />
  </ViewTransition>
```

주의점 세 가지.

1. **`default="none"`을 함께 줘야 한다.** 없으면 이름이 붙은 모든
   `ViewTransition`이 무관한 전환에서도 매번 크로스페이드된다. 단, `default="none"`을
   줄 때는 `share`를 반드시 명시해야 한다 — 둘 중 하나만 쓰면 모프가 조용히 멈춘다.
2. **`name`은 문서 내에서 유일해야 한다.** 카드가 리스트로 여러 개 있어도 각
   `trip.id`가 들어가므로 충돌하지 않는다.
3. **모프는 목적지가 같은 커밋에 렌더될 때만 재생된다.** 즉 prefetch가 되어 있어야
   한다. 목적지가 Suspense fallback으로 먼저 떨어지면 모프 대신 enter 애니메이션이
   나온다. → 뷰포트에 들어온 카드는 `<Link>` prefetch + TanStack Query
   `prefetchQuery`를 함께 걸어둔다. **prefetch는 성능 최적화가 아니라 이 애니메이션의
   전제 조건이다.**

모프 커스터마이즈는 CSS로 한다.

```css
::view-transition-group(.morph) { animation-duration: var(--vt-morph); }
::view-transition-image-pair(.morph) { animation-name: vt-blur; }
@keyframes vt-blur { 30% { filter: blur(3px); } }
```

중간에 살짝 blur를 주는 이유는 픽셀 보간 아티팩트를 가리기 위해서다.

## 5.4 패턴 2·3 — 리빌과 방향성

### Suspense 리빌

```
<Suspense fallback={<ViewTransition exit="slide-down" default="none"><Skeleton/></ViewTransition>}>
  <ViewTransition enter="slide-up" default="none"><Content/></ViewTransition>
</Suspense>
```

타이밍은 **비대칭**으로 둔다. 나가는 건 빠르게(150ms), 들어오는 건 조금 느리게
(210ms, 나가는 시간만큼 지연) + 이동은 더 길게(400ms). 사라지는 것이 주의를
끌면 안 되고, 도착하는 것은 인지할 시간이 필요하다.

### 방향성 슬라이드

`<Link transitionTypes={['nav-forward']}>` / `['nav-back']`으로 태그하고, 각 페이지를
방향 매핑 `ViewTransition`으로 감싼다.

```
<ViewTransition
  enter={{ 'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
  exit={{  'nav-forward': 'nav-forward', 'nav-back': 'nav-back', default: 'none' }}
  default="none"
>
```

**이 래퍼는 `layout.tsx`가 아니라 각 `page.tsx`에 넣는다.** 레이아웃은 네비게이션
간에 유지되므로 enter/exit가 애초에 발생하지 않는다.

슬라이드 오프셋은 60px. 화면 폭 전체를 가로지르면 사용자가 빠르게 움직이는 요소를
눈으로 추적하게 되어 피곤하다.

**헤더는 고정한다.** 슬라이드 중 헤더가 같이 움직이면 공간 기준점이 사라진다.
헤더에 `viewTransitionName: 'site-header'`를 주고 그룹 애니메이션을 끈다.
이때 `::view-transition-old(site-header) { display: none }`이 필요하다 —
없으면 구·신 헤더가 순간 겹쳐 보인다.

브라우저 뒤로가기(버튼·엣지 스와이프)는 transition type을 실어주지 않으므로
방향 슬라이드가 재생되지 않는다. 대신 §5.3의 모프는 그대로 동작한다.
**이건 결함이 아니라 올바른 기본값이다** — 시스템 제스처는 시스템 애니메이션을 갖는다.

## 5.5 Motion의 영역 — 제스처

라우트 전환은 브라우저에 맡기고, Motion은 **손가락을 따라오는 것**만 담당한다.
시간 기반 duration으로는 제스처를 자연스럽게 만들 수 없다.

| 대상 | 구현 |
| --- | --- |
| 일차/뷰 탭 스와이프 | `drag="x"` + `dragConstraints`. 놓을 때 이동거리 30% 또는 속도 500px/s 이상이면 다음 인덱스로 스냅 |
| 탭 인디케이터 | `layoutId`로 공유 → 탭 이동 시 밑줄이 자동으로 슬라이드 |
| 바텀시트 | `drag="y"`, 스냅 포인트 2개, 아래로 임계 초과 시 dismiss |
| 카드 누름 | `whileTap={{ scale: 0.985 }}`, 100ms 이내 |
| DnD | dnd-kit (Motion 아님). `TouchSensor` `{ delay: 200, tolerance: 8 }` |
| 리스트 항목 삭제 | height/opacity collapse 180ms. `layout` prop으로 잔여 항목 FLIP |

**화면 왼쪽 24px에서는 수평 드래그를 받지 않는다.** iOS Safari의 스와이프 뒤로가기와
경쟁하면 둘 다 어정쩡하게 동작한다. `dragPropagation`을 끄고 시작 좌표로 게이팅한다.

번들 관리: `motion/react`의 전체 `motion` 컴포넌트 대신 `m` + `LazyMotion`으로
기능을 지연 로드한다. 랜딩 초기 번들에 제스처 코드가 들어갈 이유가 없다.

## 5.6 모션 토큰

```
duration:  micro 120ms | exit 160ms | enter 250ms | morph 400ms | move 400ms
easing:    standard cubic-bezier(0.2, 0, 0, 1)
           exit     cubic-bezier(0.4, 0, 1, 1)
spring:    gesture { stiffness: 320, damping: 32, mass: 0.9 }
           sheet   { stiffness: 260, damping: 28 }
offset:    slide 60px | reveal 10px
```

`::view-transition-*` 의사요소는 React 트리 밖이라 Emotion으로 다룰 수 없다.
따라서 이 값들은 `:root`의 CSS 변수로 선언하고 순수 CSS에서 참조한다.

```css
:root {
  --vt-exit: 160ms;
  --vt-enter: 250ms;
  --vt-morph: 400ms;
  --vt-move: 400ms;
  --vt-slide: 60px;
}
```

### reduced-motion을 `!important` 없이 처리하기

공식 문서의 권장 스니펫은 `animation-duration: 0s !important`를 쓴다.
`::view-transition-old(*)`가 `::view-transition-old(.nav-forward)`보다 특이도가
낮아서 그냥은 못 이기기 때문이다. 이 프로젝트는 `!important`를 금지하므로
**특이도 경쟁 자체를 피한다.**

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --vt-exit: 0s;
    --vt-enter: 0s;
    --vt-morph: 0s;
    --vt-move: 0s;
    --vt-slide: 0px;
  }
}
```

모든 애니메이션 duration을 변수로만 지정해두면, 변수를 0으로 덮는 것으로 끝난다.
커스텀 프로퍼티는 상속으로 전달되므로 특이도와 무관하다.

> 커스텀 프로퍼티가 view transition 의사요소 트리까지 상속되는지는 **2단계에서
> 실기기로 검증해야 한다.** 만약 상속되지 않으면, 대안은 reduced-motion 블록에서
> 같은 특이도의 클래스별 규칙(`::view-transition-old(.nav-forward)` 등)을 소스
> 뒤쪽에 배치하는 것이다. 이 역시 `!important`가 필요 없다.

방향 슬라이드가 모션 민감성을 가장 강하게 자극한다. 모프·리빌·크로스페이드는
영향 범위가 작거나 opacity 기반이라 상대적으로 안전하다. 완전히 0으로 죽이는 대신
**슬라이드만 제거하고 크로스페이드는 남기는 것**도 선택지다.

## 5.7 체감 속도

애니메이션 품질보다 이쪽이 먼저다. 아무리 곡선을 잘 잡아도 반응이 늦으면 무의미하다.

| 장치 | 내용 |
| --- | --- |
| 즉시 누름 피드백 | 탭 즉시 `scale(0.985)` + 배경 변화. 데이터 대기와 무관하게 100ms 이내 |
| prefetch | 뷰포트 진입 카드의 라우트 + 쿼리 데이터 선반영. 모프의 전제조건이기도 함 |
| 대기 표시 | `useLinkStatus`로 pending 감지. **300ms 넘을 때만** 카드에 인라인 스피너. 그 전에는 아무것도 띄우지 않는다 |
| 스크롤 복원 | 뒤로가기 시 보던 카드 위치 유지. 탭 URL 갱신은 `{ scroll: false }` |
| 지도 인스턴스 유지 | 뷰 탭 왕복 시 MapLibre 재초기화 금지. 언마운트하지 않고 숨긴다 |
| 낙관적 업데이트 | 저장 대기 스피너를 없앤다. 실패했을 때만 알린다 |

**300ms 규칙**이 특히 중요하다. 200ms만에 끝나는 로딩에 스피너를 띄우면 깜빡임으로
인식되어 오히려 느리게 느껴진다.

## 5.8 성능 규칙

| 규칙 | 이유 |
| --- | --- |
| `transform`/`opacity`만 애니메이션 | 나머지는 레이아웃·페인트를 유발. 모바일에서 즉시 프레임 드랍 |
| 크기 변화는 `scale`로 | `width`/`height` 애니메이션 금지 |
| 그림자는 별도 레이어의 opacity로 | `box-shadow` 애니메이션은 매 프레임 리페인트 |
| `will-change`는 제스처 시작 시에만 | 상시 부여하면 GPU 메모리를 낭비하고 오히려 느려짐 |
| 전환은 짧게 | 전환 중 named 요소는 히트 테스트에서 제외된다 |
| `::view-transition { pointer-events: none }` | 전환 오버레이가 탭을 삼키는 것 방지 |
| 스크롤 관성 중 전환 시작 금지 | 스크롤과 전환이 겹치면 둘 다 끊긴다 |

## 5.9 PWA standalone 대비

`display: standalone`이 되면 브라우저 뒤로가기 버튼이 사라진다. 1단계 레이아웃부터
반영해야 나중에 화면을 다시 뜯지 않는다.

- 상세 헤더 좌측에 **앱 내 뒤로가기 버튼**을 항상 둔다. `transitionTypes={['nav-back']}`.
- 히스토리 깊이를 추적해서, 직접 진입(공유 링크 등)으로 히스토리가 없으면
  `router.back()` 대신 `/`로 보낸다. 안 하면 앱 밖으로 튀어나간다.
- Android 하드웨어 back은 `popstate`로 들어온다. 바텀시트가 열려 있으면
  이 이벤트를 먼저 소비해 시트만 닫는다. 시트가 열린 채로 페이지가 넘어가면
  방향 감각이 완전히 무너진다.
