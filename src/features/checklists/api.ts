import type {
  ChecklistCategory,
  ChecklistItem,
  CreateChecklistCategoryInput,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from "@/mocks/fixtures/checklists";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchChecklistCategories(tripId: string): Promise<ChecklistCategory[]> {
  const res = await fetch(`/api/trips/${tripId}/checklist-categories`);
  return parseJsonOrThrow<ChecklistCategory[]>(res);
}

export async function createChecklistCategory(
  input: CreateChecklistCategoryInput,
): Promise<ChecklistCategory> {
  const res = await fetch(`/api/trips/${input.tripId}/checklist-categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<ChecklistCategory>(res);
}

export async function deleteChecklistCategory(tripId: string, id: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/checklist-categories/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}

export async function fetchChecklistItems(tripId: string): Promise<ChecklistItem[]> {
  const res = await fetch(`/api/trips/${tripId}/checklist-items`);
  return parseJsonOrThrow<ChecklistItem[]>(res);
}

export async function createChecklistItem(input: CreateChecklistItemInput): Promise<ChecklistItem> {
  const res = await fetch(`/api/trips/${input.tripId}/checklist-items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<ChecklistItem>(res);
}

export async function updateChecklistItem(
  tripId: string,
  id: string,
  patch: UpdateChecklistItemInput,
): Promise<ChecklistItem> {
  const res = await fetch(`/api/trips/${tripId}/checklist-items/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonOrThrow<ChecklistItem>(res);
}

export async function deleteChecklistItem(tripId: string, id: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/checklist-items/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}
