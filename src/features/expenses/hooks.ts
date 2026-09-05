import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExpense, deleteExpense, updateExpense } from "@/features/expenses/api";
import {
  expensesKeys,
  expensesQueryOptions,
  fxRateQueryOptions,
} from "@/features/expenses/queries";
import { randomUUID } from "@/lib/id";
import type { CreateExpenseInput, Expense, UpdateExpenseInput } from "@/mocks/fixtures/expenses";

export function useExpenses(tripId: string) {
  return useQuery(expensesQueryOptions(tripId));
}

export function useFxRate(from: string, to: string) {
  return useQuery(fxRateQueryOptions(from, to));
}

export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient();
  const key = expensesKeys.all(tripId);

  return useMutation({
    mutationFn: createExpense,
    onMutate: async (input: CreateExpenseInput) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Expense[]>(key);
      const optimistic: Expense = { id: `temp_${randomUUID()}`, ...input };
      queryClient.setQueryData<Expense[]>(key, (old) => [optimistic, ...(old ?? [])]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateExpense(tripId: string) {
  const queryClient = useQueryClient();
  const key = expensesKeys.all(tripId);

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateExpenseInput }) =>
      updateExpense(tripId, id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Expense[]>(key);
      queryClient.setQueryData<Expense[]>(key, (old) =>
        (old ?? []).map((e) => (e.id === id ? { ...e, ...patch } : e)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteExpense(tripId: string) {
  const queryClient = useQueryClient();
  const key = expensesKeys.all(tripId);

  return useMutation({
    mutationFn: (id: string) => deleteExpense(tripId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Expense[]>(key);
      queryClient.setQueryData<Expense[]>(key, (old) => (old ?? []).filter((e) => e.id !== id));
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
