"use client";

import { cn } from "@/lib/utils";
import { TRIP_TABS, type TripTab } from "@/features/trips/hooks/use-trip-tab";

const TAB_LABELS: Record<TripTab, string> = {
  overview: "개요",
  planner: "플래너",
  places: "리스트",
  budget: "비용",
  prep: "준비",
  memo: "메모",
};

/**
 * 448px 프레임에 6탭을 맞춘다. 라벨을 짧게 잡아도(§docs/09 D6) 여유가 크지
 * 않으므로 가로 스크롤을 안전장치로 둔다 — 탭이 늘거나 라벨이 길어져도
 * 레이아웃이 깨지지 않는다.
 */
export function TabNavigation({
  active,
  onChange,
}: {
  active: TripTab;
  onChange: (tab: TripTab) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="여행 상세 탭"
      className="flex overflow-x-auto border-b border-border"
    >
      {TRIP_TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`trip-tabpanel-${tab}`}
            id={`trip-tab-${tab}`}
            onClick={() => onChange(tab)}
            className={cn(
              "min-h-11 flex-1 shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground",
            )}
          >
            {TAB_LABELS[tab]}
          </button>
        );
      })}
    </div>
  );
}
