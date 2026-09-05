import { http, HttpResponse } from "msw";
import { randomUUID } from "@/lib/id";
import {
  createWishlistItemInputSchema,
  initialWishlistItems,
  updateWishlistItemInputSchema,
  type WishlistItem,
} from "@/mocks/fixtures/wishlist";

let items: WishlistItem[] = [...initialWishlistItems];

export const wishlistHandlers = [
  http.get("/api/trips/:tripId/wishlist", async ({ params }) => {
    return HttpResponse.json(items.filter((i) => i.tripId === params.tripId));
  }),

  http.post("/api/trips/:tripId/wishlist", async ({ params, request }) => {
    const body = await request.json();
    const parsed = createWishlistItemInputSchema.safeParse({
      ...(body as object),
      tripId: params.tripId,
    });
    if (!parsed.success) {
      return HttpResponse.json({ message: "잘못된 입력입니다." }, { status: 400 });
    }
    const created: WishlistItem = { id: randomUUID(), ...parsed.data };
    items = [...items, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/trips/:tripId/wishlist/:id", async ({ params, request }) => {
    const body = await request.json();
    const parsed = updateWishlistItemInputSchema.safeParse(body);
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

  http.delete("/api/trips/:tripId/wishlist/:id", async ({ params }) => {
    items = items.filter((i) => !(i.id === params.id && i.tripId === params.tripId));
    return new HttpResponse(null, { status: 204 });
  }),
];
