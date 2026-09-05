/**
 * 제스처·스프링 전용 모션 토큰 (docs/05-motion-and-navigation.md §5.6).
 *
 * 라우트 전환은 이 토큰을 쓰지 않는다 — Next.js 16의 View Transitions API가
 * 무설정으로 처리한다 (docs/09-open-decisions.md D3). Motion은 손가락을
 * 따라오는 것(탭 스와이프, 바텀시트 드래그, 카드 DnD 스타일, 누름 피드백)만
 * 담당한다.
 */

export const duration = {
  /** 누름 피드백 등 즉시 반응. */
  micro: 0.12,
  /** 사라지는 콘텐츠. 나가는 건 빠르게. */
  exit: 0.16,
  /** 들어오는 콘텐츠. */
  enter: 0.25,
  /** 공유 요소 모프, 리스트 재정렬 FLIP. */
  move: 0.4,
} as const;

export const easing = {
  /** 대부분의 UI 전환 기본값. */
  standard: [0.2, 0, 0, 1] as const,
  /** 빠르게 사라져야 하는 요소. */
  exit: [0.4, 0, 1, 1] as const,
};

/** 손가락을 직접 따라가는 드래그(탭 스와이프, 카드 DnD)에 사용. */
export const gestureSpring = {
  type: "spring" as const,
  stiffness: 320,
  damping: 32,
  mass: 0.9,
};

/** 바텀시트 열림/닫힘, 스냅 포인트 이동. */
export const sheetSpring = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
};

/** 탭 스와이프·방향 슬라이드의 이동 거리. */
export const offset = {
  slide: 60,
  reveal: 10,
} as const;

/** 카드 누름 피드백. `whileTap`에 그대로 전달한다. */
export const pressTap = {
  scale: 0.985,
} as const;
