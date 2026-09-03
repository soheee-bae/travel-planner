import { queryOptions } from "@tanstack/react-query";
import { fetchPlaces } from "@/features/places/api";

export const placesKeys = {
  all: (tripId: string) => ["trips", tripId, "places"] as const,
};

export const placesQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: placesKeys.all(tripId),
    queryFn: () => fetchPlaces(tripId),
  });
