import type { Accommodation, Transport } from "@/mocks/fixtures/overview";

/**
 * 장소·미배정 개수는 Phase 5(리스트)·Phase 6(플래너)에서 실제 데이터가
 * 생기면 채워진다. 지금은 숙소·교통편 비용만 정직하게 합산해 보여준다.
 */
export function SummaryStats({
  accommodations,
  transports,
}: {
  accommodations: Accommodation[];
  transports: Transport[];
}) {
  const total =
    accommodations.reduce((sum, a) => sum + (a.cost ?? 0), 0) +
    transports.reduce((sum, t) => sum + (t.cost ?? 0), 0);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-sm font-medium text-foreground">📊 요약</p>
      <p className="mt-2 text-sm text-muted-foreground">
        숙소·교통편 비용:{" "}
        <span className="font-semibold text-money">₩{total.toLocaleString()}</span>
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        장소·비용 전체 합계는 Phase 5~7에서 채워집니다.
      </p>
    </div>
  );
}
