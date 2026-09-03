import { queryOptions } from "@tanstack/react-query";
import { fetchTrips } from "@/features/trips/api";

export const tripsKeys = {
  all: ["trips"] as const,
};

export const tripsQueryOptions = () =>
  queryOptions({
    queryKey: tripsKeys.all,
    queryFn: fetchTrips,
  });
