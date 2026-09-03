"use client";

import { motion } from "motion/react";
import { gestureSpring, pressTap } from "@/lib/motion";
import { useMotionSafeDuration } from "@/hooks/use-motion-safe";

/** P1-07 토큰 동작 확인용 임시 컴포넌트. Phase 2에서 제거. */
export function MotionDemo() {
  const enter = useMotionSafeDuration("enter");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: enter }}
      whileTap={{ ...pressTap, transition: gestureSpring }}
      className="w-fit cursor-pointer rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground"
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
    >
      Motion 토큰 확인 (눌러보기 / 좌우로 드래그)
    </motion.div>
  );
}
