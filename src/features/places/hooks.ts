import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPlace, deletePlace, updatePlace } from "@/features/places/api";
import { placesKeys, placesQueryOptions } from "@/features/places/queries";
import { randomUUID } from "@/lib/id";
import type { CreatePlaceInput, Place, UpdatePlaceInput } from "@/mocks/fixtures/places";

export function usePlaces(tripId: string) {
  return useQuery(placesQueryOptions(tripId));
}

export function useCreatePlace(tripId: string) {
  const queryClient = useQueryClient();
  const key = placesKeys.all(tripId);

  return useMutation({
    mutationFn: createPlace,
    onMutate: async (input: CreatePlaceInput) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Place[]>(key);
      const optimistic: Place = { id: `temp_${randomUUID()}`, ...input };
      queryClient.setQueryData<Place[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdatePlace(tripId: string) {
  const queryClient = useQueryClient();
  const key = placesKeys.all(tripId);

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdatePlaceInput }) =>
      updatePlace(tripId, id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Place[]>(key);
      queryClient.setQueryData<Place[]>(key, (old) =>
        (old ?? []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeletePlace(tripId: string) {
  const queryClient = useQueryClient();
  const key = placesKeys.all(tripId);

  return useMutation({
    mutationFn: (id: string) => deletePlace(tripId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Place[]>(key);
      queryClient.setQueryData<Place[]>(key, (old) => (old ?? []).filter((p) => p.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
