import { Button } from "@/components/ui/button";
import { formatDateRange } from "@/lib/date";
import type { Accommodation } from "@/mocks/fixtures/overview";

export function AccommodationCard({
  accommodation,
  onDelete,
}: {
  accommodation: Accommodation;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">🏨 {accommodation.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDateRange(accommodation.checkinDate, accommodation.checkoutDate)}
            {accommodation.checkinTime && ` · 체크인 ${accommodation.checkinTime}`}
            {accommodation.checkoutTime && ` 체크아웃 ${accommodation.checkoutTime}`}
          </p>
          {accommodation.cost != null && (
            <p className="text-xs text-money">₩{accommodation.cost.toLocaleString()}</p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          aria-label={`${accommodation.name} 삭제`}
        >
          삭제
        </Button>
      </div>
    </div>
  );
}
