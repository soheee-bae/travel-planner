"use client";

import { cn } from "@/lib/utils";
import { getTripDays } from "@/lib/trip-days";

export type PlannerDaySelection = number | "all";

export function PlannerDayTabs({
  startDate,
  endDate,
  active,
  onChange,
}: {
  startDate: string;
  endDate: string;
  active: PlannerDaySelection;
  onChange: (day: PlannerDaySelection) => void;
}) {
  const days = getTripDays(startDate, endDate);

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-border px-3 py-2">
      {days.map((day) => (
        <button
          key={day.dayIndex}
          type="button"
          onClick={() => onChange(day.dayIndex)}
          className={cn(
            "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap",
            active === day.dayIndex
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          Day{day.dayIndex}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange("all")}
        className={cn(
          "shrink-0 rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap",
          active === "all"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        전체
      </button>
    </div>
  );
}
