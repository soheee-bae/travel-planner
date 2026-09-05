import { queryOptions } from "@tanstack/react-query";
import { fetchChecklistCategories, fetchChecklistItems } from "@/features/checklists/api";

export const checklistKeys = {
  categories: (tripId: string) => ["trips", tripId, "checklist-categories"] as const,
  items: (tripId: string) => ["trips", tripId, "checklist-items"] as const,
};

export const checklistCategoriesQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: checklistKeys.categories(tripId),
    queryFn: () => fetchChecklistCategories(tripId),
  });

export const checklistItemsQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: checklistKeys.items(tripId),
    queryFn: () => fetchChecklistItems(tripId),
  });
