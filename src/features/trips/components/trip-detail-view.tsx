"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTrip } from "@/features/trips/hooks";
import { useTripTab, type TripTab } from "@/features/trips/hooks/use-trip-tab";
import { TripHeader } from "@/features/trips/components/trip-header";
import { TabNavigation } from "@/features/trips/components/tab-navigation";
import { OverviewTab } from "@/features/overview/components/overview-tab";
import { PlacesTab } from "@/features/places/components/places-tab";
import { useMotionSafeDuration } from "@/hooks/use-motion-safe";

const PLACEHOLDER_COPY: Partial<Record<TripTab, string>> = {
  planner: "지도 + 일정 플래너는 Phase 6에서 만들어집니다.",
  budget: "비용 파이차트와 일자별 내역은 Phase 7에서 만들어집니다.",
  prep: "여행 준비 체크리스트는 Phase 8에서 만들어집니다.",
  memo: "위시리스트·메모는 Phase 9에서 만들어집니다.",
};

export function TripDetailView({ tripId }: { tripId: string }) {
  const { data: trip, isLoading, isError } = useTrip(tripId);
  const { tab, setTab } = useTripTab();
  const crossfade = useMotionSafeDuration("enter");

  if (isLoading) {
    return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  }
  if (isError || !trip) {
    return <p className="p-6 text-sm text-destructive">여행을 찾을 수 없습니다.</p>;
  }

  return (
    <div className="flex flex-1 flex-col">
      <TripHeader trip={trip} />
      <TabNavigation active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            id={`trip-tabpanel-${tab}`}
            role="tabpanel"
            aria-labelledby={`trip-tab-${tab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: crossfade }}
          >
            {tab === "overview" && <OverviewTab tripId={tripId} />}
            {tab === "places" && <PlacesTab tripId={tripId} />}
            {tab !== "overview" && tab !== "places" && (
              <p className="p-6 text-sm text-muted-foreground">{PLACEHOLDER_COPY[tab]}</p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
