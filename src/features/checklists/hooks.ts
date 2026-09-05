import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createChecklistCategory,
  createChecklistItem,
  deleteChecklistCategory,
  deleteChecklistItem,
  updateChecklistItem,
} from "@/features/checklists/api";
import {
  checklistCategoriesQueryOptions,
  checklistItemsQueryOptions,
  checklistKeys,
} from "@/features/checklists/queries";
import { randomUUID } from "@/lib/id";
import type {
  ChecklistCategory,
  ChecklistItem,
  CreateChecklistCategoryInput,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from "@/mocks/fixtures/checklists";

export function useChecklistCategories(tripId: string) {
  return useQuery(checklistCategoriesQueryOptions(tripId));
}

export function useChecklistItems(tripId: string) {
  return useQuery(checklistItemsQueryOptions(tripId));
}

export function useCreateChecklistCategory(tripId: string) {
  const queryClient = useQueryClient();
  const key = checklistKeys.categories(tripId);

  return useMutation({
    mutationFn: createChecklistCategory,
    onMutate: async (input: CreateChecklistCategoryInput) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChecklistCategory[]>(key);
      const optimistic: ChecklistCategory = { id: `temp_${randomUUID()}`, ...input };
      queryClient.setQueryData<ChecklistCategory[]>(key, (old) => [...(old ?? []), optimistic]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteChecklistCategory(tripId: string) {
  const queryClient = useQueryClient();
  const categoriesKey = checklistKeys.categories(tripId);
  const itemsKey = checklistKeys.items(tripId);

  return useMutation({
    mutationFn: (id: string) => deleteChecklistCategory(tripId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: categoriesKey });
      const previous = queryClient.getQueryData<ChecklistCategory[]>(categoriesKey);
      queryClient.setQueryData<ChecklistCategory[]>(categoriesKey, (old) =>
        (old ?? []).filter((c) => c.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(categoriesKey, context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      queryClient.invalidateQueries({ queryKey: itemsKey });
    },
  });
}

export function useCreateChecklistItem(tripId: string) {
  const queryClient = useQueryClient();
  const key = checklistKeys.items(tripId);

  return useMutation({
    mutationFn: createChecklistItem,
    onMutate: async (input: CreateChecklistItemInput) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChecklistItem[]>(key);
      const optimistic: ChecklistItem = { id: `temp_${randomUUID()}`, ...input };
      queryClient.setQueryData<ChecklistItem[]>(key, (old) => [...(old ?? []), optimistic]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateChecklistItem(tripId: string) {
  const queryClient = useQueryClient();
  const key = checklistKeys.items(tripId);

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateChecklistItemInput }) =>
      updateChecklistItem(tripId, id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChecklistItem[]>(key);
      queryClient.setQueryData<ChecklistItem[]>(key, (old) =>
        (old ?? []).map((i) => (i.id === id ? { ...i, ...patch } : i)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteChecklistItem(tripId: string) {
  const queryClient = useQueryClient();
  const key = checklistKeys.items(tripId);

  return useMutation({
    mutationFn: (id: string) => deleteChecklistItem(tripId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<ChecklistItem[]>(key);
      queryClient.setQueryData<ChecklistItem[]>(key, (old) =>
        (old ?? []).filter((i) => i.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
