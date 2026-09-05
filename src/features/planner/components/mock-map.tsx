"use client";

import { cn } from "@/lib/utils";
import type { Place } from "@/mocks/fixtures/places";

const CATEGORY_DOT: Record<Place["category"], string> = {
  관광: "bg-category-sight-bg",
  맛집: "bg-category-food-bg",
  카페: "bg-category-cafe-bg",
  쇼핑: "bg-category-shop-bg",
  액티비티: "bg-category-transport-bg",
  기타: "bg-category-move-bg",
};

interface Positioned {
  place: Place;
  xPct: number;
  yPct: number;
}

function project(places: Place[]): Positioned[] {
  const withCoords = places.filter((p) => p.lat != null && p.lng != null);
  if (withCoords.length === 0) return [];

  const lats = withCoords.map((p) => p.lat!);
  const lngs = withCoords.map((p) => p.lng!);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;
  const PADDING = 12;

  return withCoords.map((place) => ({
    place,
    xPct: PADDING + ((place.lng! - minLng) / lngRange) * (100 - PADDING * 2),
    // 위도는 위→아래로 갈수록 감소하므로 y축은 반전한다.
    yPct: PADDING + (1 - (place.lat! - minLat) / latRange) * (100 - PADDING * 2),
  }));
}

/**
 * Naver/Google Maps API 키가 없어(docs/09 D4) 실제 지도 대신 좌표를
 * 정규화해 배치하는 mock 지도다. 어댑터 경계(lib/map-provider.ts)는 이미
 * 준비되어 있어 키가 생기면 이 컴포넌트만 교체하면 된다.
 */
export function MockMap({
  places,
  activeDayIndex,
  selectedPlaceId,
  onSelectPlace,
}: {
  places: Place[];
  activeDayIndex: number | "all";
  selectedPlaceId?: string;
  onSelectPlace?: (placeId: string) => void;
}) {
  const positioned = project(places);

  return (
    <div
      className="relative h-56 w-full overflow-hidden rounded-lg border border-border bg-[linear-gradient(0deg,transparent_24%,var(--border)_25%,var(--border)_26%,transparent_27%,transparent_74%,var(--border)_75%,var(--border)_76%,transparent_77%,transparent),linear-gradient(90deg,transparent_24%,var(--border)_25%,var(--border)_26%,transparent_27%,transparent_74%,var(--border)_75%,var(--border)_76%,transparent_77%,transparent)] bg-muted"
      style={{ backgroundSize: "25% 25%" }}
      role="img"
      aria-label="일정 지도 (mock, 실제 지도 API 연동 전)"
    >
      {positioned.map(({ place, xPct, yPct }) => {
        const isCurrentDay = activeDayIndex === "all" || place.dayIndex === activeDayIndex;
        const isUnassigned = place.dayIndex == null;
        return (
          <button
            key={place.id}
            type="button"
            onClick={() => onSelectPlace?.(place.id)}
            aria-label={place.name}
            title={place.name}
            className={cn(
              "absolute flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-card text-[10px] font-bold shadow-sm transition-transform",
              isUnassigned
                ? "bg-muted-foreground/40 text-card"
                : cn(CATEGORY_DOT[place.category], "text-foreground"),
              !isCurrentDay && !isUnassigned && "opacity-30",
              selectedPlaceId === place.id && "scale-125 ring-2 ring-primary",
            )}
            style={{ left: `${xPct}%`, top: `${yPct}%` }}
          >
            {place.dayIndex ?? "?"}
          </button>
        );
      })}
    </div>
  );
}
