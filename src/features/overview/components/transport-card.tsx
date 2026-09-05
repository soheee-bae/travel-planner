import { Button } from "@/components/ui/button";
import type { Transport } from "@/mocks/fixtures/overview";

const TYPE_ICON: Record<Transport["type"], string> = {
  비행기: "🛫",
  KTX: "🚄",
  버스: "🚌",
  렌터카: "🚗",
  페리: "⛴️",
};

function formatTime(iso: string) {
  return iso.slice(11, 16);
}

export function TransportCard({
  transport,
  onDelete,
}: {
  transport: Transport;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-foreground">
            {TYPE_ICON[transport.type]} {transport.departureFrom} → {transport.arrivalTo}{" "}
            {formatTime(transport.departureAt)}
          </p>
          {transport.bookingRef && (
            <p className="text-xs text-muted-foreground">
              {transport.type} {transport.bookingRef}
            </p>
          )}
          {transport.cost != null && (
            <p className="text-xs text-money">₩{transport.cost.toLocaleString()}</p>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
          aria-label={`${transport.departureFrom}→${transport.arrivalTo} 삭제`}
        >
          삭제
        </Button>
      </div>
    </div>
  );
}
