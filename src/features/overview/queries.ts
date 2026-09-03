import { queryOptions } from "@tanstack/react-query";
import { fetchAccommodations, fetchTransports } from "@/features/overview/api";

export const overviewKeys = {
  accommodations: (tripId: string) => ["trips", tripId, "accommodations"] as const,
  transports: (tripId: string) => ["trips", tripId, "transports"] as const,
};

export const accommodationsQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: overviewKeys.accommodations(tripId),
    queryFn: () => fetchAccommodations(tripId),
  });

export const transportsQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: overviewKeys.transports(tripId),
    queryFn: () => fetchTransports(tripId),
  });
