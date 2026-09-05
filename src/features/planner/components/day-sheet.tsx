"use client";

import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { sheetSpring } from "@/lib/motion";

const HEIGHT_PEEK = 220;
const HEIGHT_FULL = 480;
const DRAG_CLOSE_THRESHOLD = 60;

/**
 * 지도 아래 붙는 일정 시트. 핸들 영역에서만 드래그를 받는다 — 본문 리스트는
 * 스크롤과 DnD 카드 드래그가 이미 그 영역의 제스처를 쓰고 있어서, 시트를
 * 여닫는 제스처와 겹치면 안 된다(docs/09 D5 제스처 중재 원칙).
 */
export function DaySheet({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      className="flex flex-col overflow-hidden rounded-t-xl border border-border bg-card"
      animate={{ height: expanded ? HEIGHT_FULL : HEIGHT_PEEK }}
      transition={sheetSpring}
    >
      <motion.div
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={expanded ? "일정 시트 접기" : "일정 시트 펼치기"}
        onClick={() => setExpanded((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setExpanded((v) => !v);
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.4}
        onDragEnd={(_, info) => {
          if (info.offset.y > DRAG_CLOSE_THRESHOLD) setExpanded(false);
          else if (info.offset.y < -DRAG_CLOSE_THRESHOLD) setExpanded(true);
        }}
        className="flex shrink-0 cursor-pointer touch-none flex-col items-center gap-1 py-2"
      >
        <span className="h-1 w-9 rounded-full bg-border" />
      </motion.div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-3">{children}</div>
    </motion.div>
  );
}
