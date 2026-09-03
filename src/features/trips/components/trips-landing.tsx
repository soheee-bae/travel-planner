"use client";

import { Plus } from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { Fab } from "@/components/ui/fab";
import { useTrips } from "@/features/trips/hooks";
import { TripCard } from "@/features/trips/components/trip-card";
import { TripListSkeleton } from "@/features/trips/components/trip-list-skeleton";

export function TripsLanding() {
  const { data: trips, isLoading, isError } = useTrips();

  return (
    <>
      <main className="flex flex-1 flex-col gap-4 overflow-y-auto p-6 pb-24">
        <h1 className="font-serif text-2xl font-semibold text-foreground">✈️ 나의 여행</h1>

        {isLoading && <TripListSkeleton />}

        {isError && <p className="text-sm text-destructive">여행 목록을 불러오지 못했습니다.</p>}

        {!isLoading && !isError && trips?.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">첫 여행을 만들어 보세요</p>
          </div>
        )}

        {!isLoading && !isError && trips?.map((trip) => <TripCard key={trip.id} trip={trip} />)}
      </main>

      <Fab href="/trips/new" label="여행 추가">
        <Plus className="size-6" aria-hidden="true" />
      </Fab>

      <BottomNav
        items={[{ href: "/trips", label: "여행", icon: <span aria-hidden="true">✈️</span> }]}
      />
    </>
  );
}
