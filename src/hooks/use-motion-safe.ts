"use client";

import { useReducedMotion } from "motion/react";
import { duration as motionDuration } from "@/lib/motion";

/**
 * `prefers-reduced-motion: reduce` 사용자에게는 duration을 0으로 낮춘다.
 * 위치 이동(슬라이드)은 완전히 제거하고, opacity 기반 전환만 즉시 처리된다.
 *
 * View Transitions 쪽 reduced-motion 처리는 CSS 커스텀 프로퍼티로 별도 처리한다
 * (docs/05-motion-and-navigation.md §5.6). 이 훅은 Motion(제스처) 레이어 전용.
 */
export function useMotionSafeDuration(key: keyof typeof motionDuration) {
  const prefersReducedMotion = useReducedMotion();
  return prefersReducedMotion ? 0 : motionDuration[key];
}

export { useReducedMotion };
