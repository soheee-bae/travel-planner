"use client";

import { ViewTransition } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { useTrip } from "@/features/trips/hooks";
import { formatDateRange, formatDuration } from "@/lib/date";

/**
 * Phase 4에서 실제 6탭(개요/플래너/리스트/비용/준비/메모) 헤더로 교체된다.
 * 지금은 TripCard와의 공유 요소 모프 전환을 확인하기 위한 최소 화면이다.
 */
export function TripDetailPlaceholder({ tripId }: { tripId: string }) {
  const { data: trip, isLoading, isError } = useTrip(tripId);

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <Link href="/trips" className="flex w-fit items-center gap-1 text-sm text-muted-foreground">
        <ChevronLeft className="size-4" aria-hidden="true" />
        여행 목록
      </Link>

      {isLoading && <p className="text-sm text-muted-foreground">불러오는 중…</p>}
      {isError && <p className="text-sm text-destructive">여행을 찾을 수 없습니다.</p>}

      {trip && (
        <>
          <ViewTransition name={`trip-cover-${trip.id}`}>
            <div className="flex flex-col gap-1">
              <h1 className="font-serif text-2xl font-semibold text-foreground">
                {trip.coverEmoji} {trip.title}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatDuration(trip.startDate, trip.endDate)} ·{" "}
                {formatDateRange(trip.startDate, trip.endDate)}
              </p>
              <p className="text-sm text-muted-foreground">{trip.companions}</p>
            </div>
          </ViewTransition>

          <p className="text-sm text-muted-foreground">
            Phase 4에서 개요·플래너·리스트·비용·준비·메모 6탭이 여기에 채워집니다.
          </p>
        </>
      )}
    </main>
  );
}
