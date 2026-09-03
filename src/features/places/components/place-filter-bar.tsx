import { cn } from "@/lib/utils";
import { PLACE_CATEGORIES, type PlaceCategory } from "@/mocks/fixtures/places";

export type PlaceFilter = "전체" | PlaceCategory;
const FILTERS: PlaceFilter[] = ["전체", ...PLACE_CATEGORIES];

export function PlaceFilterBar({
  active,
  onChange,
  counts,
}: {
  active: PlaceFilter;
  onChange: (filter: PlaceFilter) => void;
  counts: Record<PlaceFilter, number>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="카테고리 필터">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          type="button"
          role="tab"
          aria-selected={active === filter}
          onClick={() => onChange(filter)}
          className={cn(
            "shrink-0 rounded-md border px-3 py-1.5 text-sm whitespace-nowrap",
            active === filter
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border text-muted-foreground",
          )}
        >
          {filter} {counts[filter] > 0 && `(${counts[filter]})`}
        </button>
      ))}
    </div>
  );
}
