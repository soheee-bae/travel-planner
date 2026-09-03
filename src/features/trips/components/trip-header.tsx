import { ViewTransition } from "react";
import Link from "next/link";
import { ChevronLeft, Pencil } from "lucide-react";
import { formatDateRange, formatDuration } from "@/lib/date";
import type { Trip } from "@/mocks/fixtures/trips";

export function TripHeader({ trip }: { trip: Trip }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-card px-4 py-3">
      <div className="flex items-center justify-between">
        <Link
          href="/trips"
          aria-label="여행 목록으로"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground"
        >
          <ChevronLeft className="size-5" />
        </Link>
        <ViewTransition name={`trip-cover-${trip.id}`}>
          <h1 className="truncate text-base font-semibold text-foreground">
            {trip.coverEmoji} {trip.title}
          </h1>
        </ViewTransition>
        <button
          type="button"
          aria-label="여행 편집"
          className="flex size-9 items-center justify-center rounded-full text-muted-foreground"
        >
          <Pencil className="size-4" />
        </button>
      </div>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        {formatDuration(trip.startDate, trip.endDate)} ·{" "}
        {formatDateRange(trip.startDate, trip.endDate)} · {trip.companions}
      </p>
    </header>
  );
}
