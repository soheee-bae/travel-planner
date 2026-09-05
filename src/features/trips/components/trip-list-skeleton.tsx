/** 실제 TripCard와 높이가 같아야 한다 — 어긋나면 로딩 후 레이아웃이 튄다(CLS). */
export function TripListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-hidden="true">
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
          <div className="h-5 w-2/3 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-1/2 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}
