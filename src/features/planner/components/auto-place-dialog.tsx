"use client";

import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { kMeansCluster } from "@/lib/clustering";
import { getTripDays } from "@/lib/trip-days";
import { useUpdatePlace } from "@/features/places/hooks";
import type { Place } from "@/mocks/fixtures/places";

function hasCoords(place: Place): place is Place & { lat: number; lng: number } {
  return place.lat != null && place.lng != null;
}

/**
 * 위치 기반으로 미배정 장소를 Day별로 묶어 제안한다. 제안일 뿐이다 —
 * 사용자가 확인하고 눌러야 실제로 배정된다(자동 적용 금지,
 * docs/06-features-and-algorithms.md §6.4).
 */
export function AutoPlaceDialog({
  tripId,
  startDate,
  endDate,
  places,
}: {
  tripId: string;
  startDate: string;
  endDate: string;
  places: Place[];
}) {
  const [open, setOpen] = useState(false);
  const updatePlace = useUpdatePlace(tripId);
  const days = getTripDays(startDate, endDate);

  const unassignedWithCoords = useMemo(
    () => places.filter((p) => p.dayIndex == null).filter(hasCoords),
    [places],
  );

  const suggestion = useMemo(() => {
    if (!open || unassignedWithCoords.length === 0) return new Map<string, number>();
    return kMeansCluster(unassignedWithCoords, days.length);
  }, [open, unassignedWithCoords, days.length]);

  const groups = useMemo(() => {
    const byDay = new Map<number, Place[]>();
    for (const place of unassignedWithCoords) {
      const cluster = suggestion.get(place.id) ?? 0;
      const dayIndex = cluster + 1;
      byDay.set(dayIndex, [...(byDay.get(dayIndex) ?? []), place]);
    }
    return byDay;
  }, [unassignedWithCoords, suggestion]);

  function applyAll() {
    for (const [dayIndex, dayPlaces] of groups) {
      dayPlaces.forEach((place, i) => {
        updatePlace.mutate({ id: place.id, patch: { dayIndex, orderIndex: i } });
      });
    }
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1">
          <Sparkles className="size-4" aria-hidden="true" />
          자동 배치
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>자동 배치 제안</DialogTitle>
        </DialogHeader>
        {unassignedWithCoords.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            좌표가 있는 미배정 장소가 없어 제안할 수 없어요.
          </p>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              위치가 가까운 곳끼리 묶어봤어요. 확인하고 적용해 주세요.
            </p>
            <div className="flex flex-col gap-3">
              {Array.from(groups.entries())
                .sort(([a], [b]) => a - b)
                .map(([dayIndex, dayPlaces]) => (
                  <div key={dayIndex} className="rounded-md border border-border p-3">
                    <p className="text-sm font-medium text-foreground">Day{dayIndex}</p>
                    <p className="text-xs text-muted-foreground">
                      {dayPlaces.map((p) => p.name).join(" · ")}
                    </p>
                  </div>
                ))}
            </div>
            <Button onClick={applyAll} className="h-10">
              이대로 적용
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
