"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { usePlaces, useUpdatePlace } from "@/features/places/hooks";
import { MockMap } from "@/features/planner/components/mock-map";
import {
  PlannerDayTabs,
  type PlannerDaySelection,
} from "@/features/planner/components/planner-day-tabs";
import { DaySheet } from "@/features/planner/components/day-sheet";
import { DayItineraryList } from "@/features/planner/components/day-itinerary-list";
import { AutoPlaceDialog } from "@/features/planner/components/auto-place-dialog";
import { getTripDays } from "@/lib/trip-days";
import type { Trip } from "@/mocks/fixtures/trips";

export function PlannerTab({ trip }: { trip: Trip }) {
  const { data: places, isLoading, isError } = usePlaces(trip.id);
  const updatePlace = useUpdatePlace(trip.id);
  const [activeDay, setActiveDay] = useState<PlannerDaySelection>(1);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>();

  const days = getTripDays(trip.startDate, trip.endDate);

  const dayItems = useMemo(() => {
    if (!places || activeDay === "all") return [];
    return places
      .filter((p) => p.dayIndex === activeDay)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [places, activeDay]);

  const selectedPlace = places?.find((p) => p.id === selectedPlaceId);
  const showAssignBar = selectedPlace && selectedPlace.dayIndex == null;

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (isError)
    return <p className="p-6 text-sm text-destructive">장소 목록을 불러오지 못했습니다.</p>;

  return (
    <div className="flex flex-col gap-2">
      <PlannerDayTabs
        startDate={trip.startDate}
        endDate={trip.endDate}
        active={activeDay}
        onChange={(day) => {
          setActiveDay(day);
          setSelectedPlaceId(undefined);
        }}
      />

      <div className="px-3">
        <MockMap
          places={places ?? []}
          activeDayIndex={activeDay}
          selectedPlaceId={selectedPlaceId}
          onSelectPlace={setSelectedPlaceId}
        />
      </div>

      {showAssignBar && (
        <div className="mx-3 flex flex-wrap items-center gap-2 rounded-md border border-dashed border-border p-2 text-sm">
          <span className="text-foreground">{selectedPlace.name}을</span>
          {days.map((day) => (
            <Button
              key={day.dayIndex}
              size="sm"
              variant="outline"
              onClick={() => {
                updatePlace.mutate({
                  id: selectedPlace.id,
                  patch: { dayIndex: day.dayIndex, orderIndex: 0 },
                });
                setSelectedPlaceId(undefined);
              }}
            >
              Day{day.dayIndex}에 추가
            </Button>
          ))}
        </div>
      )}

      {activeDay === "all" && (
        <div className="mx-3">
          <AutoPlaceDialog
            tripId={trip.id}
            startDate={trip.startDate}
            endDate={trip.endDate}
            places={places ?? []}
          />
        </div>
      )}

      {activeDay !== "all" && (
        <DaySheet>
          <DayItineraryList tripId={trip.id} places={dayItems} />
        </DaySheet>
      )}
    </div>
  );
}
