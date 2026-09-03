"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useMotionSafeDuration } from "@/hooks/use-motion-safe";

const MIN_VISIBLE_MS = 700;

/**
 * 라우트가 아니라 오버레이다 (docs/09 D9). 스플래시를 별도 라우트로 두면
 * 뒤로가기가 스플래시로 돌아가고, PWA standalone에서 히스토리가 오염된다.
 * 랜딩 콘텐츠 위에 잠깐 덮었다가 fade out 한다.
 */
export function Splash() {
  const [visible, setVisible] = useState(true);
  const exitDuration = useMotionSafeDuration("exit");

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="presentation"
          aria-hidden="true"
          exit={{ opacity: 0 }}
          transition={{ duration: exitDuration }}
          className="pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-background"
        >
          <motion.span
            className="text-4xl"
            animate={{ x: [-8, 8, -8] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            ✈️
          </motion.span>
          <p className="font-serif text-lg font-semibold text-foreground">여행 플래너</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
