import { queryOptions } from "@tanstack/react-query";
import { fetchTrip, fetchTrips } from "@/features/trips/api";

export const tripsKeys = {
  all: ["trips"] as const,
  detail: (id: string) => ["trips", id] as const,
};

export const tripsQueryOptions = () =>
  queryOptions({
    queryKey: tripsKeys.all,
    queryFn: fetchTrips,
  });

export const tripQueryOptions = (id: string) =>
  queryOptions({
    queryKey: tripsKeys.detail(id),
    queryFn: () => fetchTrip(id),
  });
