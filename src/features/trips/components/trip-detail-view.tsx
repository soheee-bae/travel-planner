"use client";

import { AnimatePresence, motion } from "motion/react";
import { useTrip } from "@/features/trips/hooks";
import { useTripTab } from "@/features/trips/hooks/use-trip-tab";
import { TripHeader } from "@/features/trips/components/trip-header";
import { TabNavigation } from "@/features/trips/components/tab-navigation";
import { OverviewTab } from "@/features/overview/components/overview-tab";
import { PlacesTab } from "@/features/places/components/places-tab";
import { PlannerTab } from "@/features/planner/components/planner-tab";
import { BudgetTab } from "@/features/expenses/components/budget-tab";
import { PrepTab } from "@/features/checklists/components/prep-tab";
import { MemoTab } from "@/features/wishlist/components/memo-tab";
import { useMotionSafeDuration } from "@/hooks/use-motion-safe";

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
            {tab === "planner" && <PlannerTab trip={trip} />}
            {tab === "budget" && <BudgetTab trip={trip} />}
            {tab === "prep" && <PrepTab tripId={tripId} />}
            {tab === "memo" && <MemoTab tripId={tripId} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
