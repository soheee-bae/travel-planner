import { ViewTransition } from "react";
import Link from "next/link";
import { formatDateRange, formatDuration } from "@/lib/date";
import type { Trip } from "@/mocks/fixtures/trips";

/**
 * 카드 → 상세 전환은 View Transitions API로 처리한다 (docs/09 D3, App Router
 * 무설정 지원). 카드와 상세 헤더가 같은 name을 가지면 브라우저가 자동으로
 * 모프 애니메이션을 만든다 — 별도 CSS 없이도 동작한다.
 */
export function TripCard({ trip }: { trip: Trip }) {
  return (
    <Link
      href={`/trips/${trip.id}`}
      prefetch
      className="block rounded-lg border border-border bg-card p-4 transition-colors active:bg-muted"
    >
      <ViewTransition name={`trip-cover-${trip.id}`}>
        <div className="flex flex-col gap-1">
          <p className="text-base font-semibold text-foreground">
            {trip.coverEmoji} {trip.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDuration(trip.startDate, trip.endDate)} ·{" "}
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
          <p className="text-sm text-muted-foreground">{trip.companions}</p>
        </div>
      </ViewTransition>
    </Link>
  );
}
