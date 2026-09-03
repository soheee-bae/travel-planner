"use client";

import {
  useAccommodations,
  useDeleteAccommodation,
  useDeleteTransport,
  useTransports,
} from "@/features/overview/hooks";
import { AccommodationCard } from "@/features/overview/components/accommodation-card";
import { TransportCard } from "@/features/overview/components/transport-card";
import { AddAccommodationDialog } from "@/features/overview/components/add-accommodation-dialog";
import { AddTransportDialog } from "@/features/overview/components/add-transport-dialog";
import { SummaryStats } from "@/features/overview/components/summary-stats";

export function OverviewTab({ tripId }: { tripId: string }) {
  const { data: accommodations, isLoading: loadingAcc } = useAccommodations(tripId);
  const { data: transports, isLoading: loadingTr } = useTransports(tripId);
  const deleteAccommodation = useDeleteAccommodation(tripId);
  const deleteTransport = useDeleteTransport(tripId);

  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">🏨 숙소</h2>
          <AddAccommodationDialog tripId={tripId} />
        </div>
        {loadingAcc && <p className="text-sm text-muted-foreground">불러오는 중…</p>}
        {!loadingAcc && accommodations?.length === 0 && (
          <p className="text-sm text-muted-foreground">등록된 숙소가 없습니다.</p>
        )}
        {accommodations?.map((acc) => (
          <AccommodationCard
            key={acc.id}
            accommodation={acc}
            onDelete={() => deleteAccommodation.mutate(acc.id)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">✈️ 교통</h2>
          <AddTransportDialog tripId={tripId} />
        </div>
        {loadingTr && <p className="text-sm text-muted-foreground">불러오는 중…</p>}
        {!loadingTr && transports?.length === 0 && (
          <p className="text-sm text-muted-foreground">등록된 교통편이 없습니다.</p>
        )}
        {transports?.map((tr) => (
          <TransportCard
            key={tr.id}
            transport={tr}
            onDelete={() => deleteTransport.mutate(tr.id)}
          />
        ))}
      </section>

      <SummaryStats accommodations={accommodations ?? []} transports={transports ?? []} />
    </div>
  );
}
