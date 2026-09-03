import { Button } from "@/components/ui/button";
import type { Place } from "@/mocks/fixtures/places";

const CATEGORY_ICON: Record<Place["category"], string> = {
  관광: "🏛️",
  맛집: "🍽️",
  카페: "☕",
  쇼핑: "🛍️",
  액티비티: "🎢",
  기타: "📍",
};

const PRIORITY_BADGE: Record<Place["priority"], string> = {
  필수: "⭐ 필수",
  가능하면: "",
  시간되면: "",
};

export function PlaceCard({
  place,
  selected,
  selectionMode,
  onToggleSelect,
  onDelete,
}: {
  place: Place;
  selected?: boolean;
  selectionMode?: boolean;
  onToggleSelect?: () => void;
  onDelete?: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
      onClick={selectionMode ? onToggleSelect : undefined}
    >
      {selectionMode && (
        <input
          type="checkbox"
          checked={!!selected}
          onChange={onToggleSelect}
          // 카드 전체가 이미 toggle을 처리한다 — 버블링으로 두 번 토글되는
          // 것을 막는다 (클릭 한 번 = 토글 한 번).
          onClick={(e) => e.stopPropagation()}
          className="size-5 shrink-0"
          aria-label={`${place.name} 선택`}
        />
      )}
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            {CATEGORY_ICON[place.category]} {place.name}
          </p>
          <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {place.dayIndex ? `Day${place.dayIndex}` : "미정"}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          {PRIORITY_BADGE[place.priority] && `${PRIORITY_BADGE[place.priority]} · `}
          {place.address && `📍 ${place.address} · `}
          {place.estimatedCost != null &&
            `${place.costCurrency ?? ""} ${place.estimatedCost.toLocaleString()}`}
        </p>
        {place.memo && <p className="text-xs text-muted-foreground">{place.memo}</p>}
      </div>
      {!selectionMode && onDelete && (
        <Button size="sm" variant="ghost" onClick={onDelete} aria-label={`${place.name} 삭제`}>
          삭제
        </Button>
      )}
    </div>
  );
}
