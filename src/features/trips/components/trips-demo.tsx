"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCreateTrip, useDeleteTrip, useTrips } from "@/features/trips/hooks";

/**
 * P1-08 검증용 임시 컴포넌트. React Query + MSW로 목 데이터 CRUD 왕복이
 * 즉시 반영되는지 확인한다. Phase 3(여행 CRUD)에서 실제 폼으로 교체된다.
 */
export function TripsDemo() {
  const { data: trips, isLoading, isError } = useTrips();
  const createTrip = useCreateTrip();
  const deleteTrip = useDeleteTrip();
  const [title, setTitle] = useState("");

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">불러오는 중…</p>;
  }
  if (isError) {
    return <p className="text-sm text-destructive">목록을 불러오지 못했습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col gap-2">
        {trips?.map((trip) => (
          <li
            key={trip.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3"
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                {trip.coverEmoji} {trip.title}
              </p>
              <p className="text-xs text-muted-foreground">
                {trip.startDate} ~ {trip.endDate} · {trip.companions}
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteTrip.mutate(trip.id)}
              aria-label={`${trip.title} 삭제`}
            >
              삭제
            </Button>
          </li>
        ))}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          createTrip.mutate({
            title,
            destinationCountry: "KR",
            destinationCity: "미정",
            startDate: "2026-12-01",
            endDate: "2026-12-03",
            companions: "혼자",
            coverEmoji: "✈️",
          });
          setTitle("");
        }}
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="여행 제목 입력 후 추가"
          aria-label="새 여행 제목"
          className="h-9 flex-1 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
        />
        <Button type="submit" disabled={createTrip.isPending}>
          추가
        </Button>
      </form>
    </div>
  );
}
