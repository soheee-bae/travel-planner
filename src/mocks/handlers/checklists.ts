import { http, HttpResponse } from "msw";
import { randomUUID } from "@/lib/id";
import {
  createChecklistCategoryInputSchema,
  createChecklistItemInputSchema,
  initialChecklistCategories,
  initialChecklistItems,
  updateChecklistItemInputSchema,
  type ChecklistCategory,
  type ChecklistItem,
} from "@/mocks/fixtures/checklists";

let categories: ChecklistCategory[] = [...initialChecklistCategories];
let items: ChecklistItem[] = [...initialChecklistItems];

export const checklistsHandlers = [
  http.get("/api/trips/:tripId/checklist-categories", async ({ params }) => {
    return HttpResponse.json(categories.filter((c) => c.tripId === params.tripId));
  }),

  http.post("/api/trips/:tripId/checklist-categories", async ({ params, request }) => {
    const body = await request.json();
    const parsed = createChecklistCategoryInputSchema.safeParse({
      ...(body as object),
      tripId: params.tripId,
    });
    if (!parsed.success) {
      return HttpResponse.json({ message: "잘못된 입력입니다." }, { status: 400 });
    }
    const created: ChecklistCategory = { id: randomUUID(), ...parsed.data };
    categories = [...categories, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.delete("/api/trips/:tripId/checklist-categories/:id", async ({ params }) => {
    categories = categories.filter((c) => c.id !== params.id);
    items = items.filter((i) => i.categoryId !== params.id);
    return new HttpResponse(null, { status: 204 });
  }),

  http.get("/api/trips/:tripId/checklist-items", async ({ params }) => {
    return HttpResponse.json(items.filter((i) => i.tripId === params.tripId));
  }),

  http.post("/api/trips/:tripId/checklist-items", async ({ params, request }) => {
    const body = await request.json();
    const parsed = createChecklistItemInputSchema.safeParse({
      ...(body as object),
      tripId: params.tripId,
    });
    if (!parsed.success) {
      return HttpResponse.json({ message: "잘못된 입력입니다." }, { status: 400 });
    }
    const created: ChecklistItem = { id: randomUUID(), ...parsed.data };
    items = [...items, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/trips/:tripId/checklist-items/:id", async ({ params, request }) => {
    const body = await request.json();
    const parsed = updateChecklistItemInputSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json({ message: "잘못된 입력입니다." }, { status: 400 });
    }
    const index = items.findIndex((i) => i.id === params.id && i.tripId === params.tripId);
    if (index === -1) {
      return HttpResponse.json({ message: "항목을 찾을 수 없습니다." }, { status: 404 });
    }
    items[index] = { ...items[index], ...parsed.data };
    return HttpResponse.json(items[index]);
  }),

  http.delete("/api/trips/:tripId/checklist-items/:id", async ({ params }) => {
    items = items.filter((i) => !(i.id === params.id && i.tripId === params.tripId));
    return new HttpResponse(null, { status: 204 });
  }),
];
