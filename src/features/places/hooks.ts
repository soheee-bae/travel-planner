import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
} from "@/features/expenses/api";
import { expensesKeys } from "@/features/expenses/queries";
import { createPlace, deletePlace, updatePlace } from "@/features/places/api";
import { placesKeys, placesQueryOptions } from "@/features/places/queries";
import { fetchTrip } from "@/features/trips/api";
import { randomUUID } from "@/lib/id";
import {
  buildAutoExpenseFromPlace,
  canOverwriteExpense,
  findLinkedExpense,
} from "@/lib/place-expense-sync";
import type { CreatePlaceInput, Place, UpdatePlaceInput } from "@/mocks/fixtures/places";

async function syncAutoExpense(place: Place): Promise<void> {
  const trip = await fetchTrip(place.tripId);
  const draft = buildAutoExpenseFromPlace(place, trip.baseCurrency, trip.startDate);
  if (!draft) return;
  const expenses = await fetchExpenses(place.tripId);
  const linked = findLinkedExpense(expenses, place.id);
  if (!canOverwriteExpense(linked)) return;
  if (linked) {
    await updateExpense(place.tripId, linked.id, {
      amount: draft.amount,
      title: draft.title,
      category: draft.category,
      dayIndex: draft.dayIndex,
      isManual: false,
    });
  } else {
    await createExpense(draft);
  }
}

async function removeAutoExpense(tripId: string, placeId: string): Promise<void> {
  const expenses = await fetchExpenses(tripId);
  const linked = findLinkedExpense(expenses, placeId);
  if (linked && !linked.isManual) {
    await deleteExpense(tripId, linked.id);
  }
}

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
    onSuccess: async (created) => {
      await syncAutoExpense(created);
      await queryClient.invalidateQueries({ queryKey: expensesKeys.all(tripId) });
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
    onSuccess: async (_updated, { id, patch }) => {
      const places = queryClient.getQueryData<Place[]>(key);
      const place = places?.find((p) => p.id === id);
      if (place && (patch.estimatedCost !== undefined || patch.name || patch.category)) {
        await syncAutoExpense({ ...place, ...patch });
        await queryClient.invalidateQueries({ queryKey: expensesKeys.all(tripId) });
      }
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
    onSuccess: async (_void, id) => {
      await removeAutoExpense(tripId, id);
      await queryClient.invalidateQueries({ queryKey: expensesKeys.all(tripId) });
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
