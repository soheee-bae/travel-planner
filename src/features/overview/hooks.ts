import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createAccommodation,
  createTransport,
  deleteAccommodation,
  deleteTransport,
} from "@/features/overview/api";
import {
  accommodationsQueryOptions,
  overviewKeys,
  transportsQueryOptions,
} from "@/features/overview/queries";
import { randomUUID } from "@/lib/id";
import type {
  Accommodation,
  CreateAccommodationInput,
  CreateTransportInput,
  Transport,
} from "@/mocks/fixtures/overview";

export function useAccommodations(tripId: string) {
  return useQuery(accommodationsQueryOptions(tripId));
}

export function useCreateAccommodation(tripId: string) {
  const queryClient = useQueryClient();
  const key = overviewKeys.accommodations(tripId);

  return useMutation({
    mutationFn: createAccommodation,
    onMutate: async (input: CreateAccommodationInput) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Accommodation[]>(key);
      const optimistic: Accommodation = { id: `temp_${randomUUID()}`, ...input };
      queryClient.setQueryData<Accommodation[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteAccommodation(tripId: string) {
  const queryClient = useQueryClient();
  const key = overviewKeys.accommodations(tripId);

  return useMutation({
    mutationFn: (id: string) => deleteAccommodation(tripId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Accommodation[]>(key);
      queryClient.setQueryData<Accommodation[]>(key, (old) =>
        (old ?? []).filter((a) => a.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useTransports(tripId: string) {
  return useQuery(transportsQueryOptions(tripId));
}

export function useCreateTransport(tripId: string) {
  const queryClient = useQueryClient();
  const key = overviewKeys.transports(tripId);

  return useMutation({
    mutationFn: createTransport,
    onMutate: async (input: CreateTransportInput) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Transport[]>(key);
      const optimistic: Transport = { id: `temp_${randomUUID()}`, ...input };
      queryClient.setQueryData<Transport[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteTransport(tripId: string) {
  const queryClient = useQueryClient();
  const key = overviewKeys.transports(tripId);

  return useMutation({
    mutationFn: (id: string) => deleteTransport(tripId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Transport[]>(key);
      queryClient.setQueryData<Transport[]>(key, (old) => (old ?? []).filter((t) => t.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
