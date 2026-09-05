import { http, HttpResponse } from "msw";
import { randomUUID } from "@/lib/id";
import {
  createPlaceInputSchema,
  initialPlaces,
  updatePlaceInputSchema,
  type Place,
} from "@/mocks/fixtures/places";

let places: Place[] = [...initialPlaces];

export const placesHandlers = [
  http.get("/api/trips/:tripId/places", async ({ params }) => {
    return HttpResponse.json(places.filter((p) => p.tripId === params.tripId));
  }),

  http.post("/api/trips/:tripId/places", async ({ params, request }) => {
    const body = await request.json();
    const parsed = createPlaceInputSchema.safeParse({
      ...(body as object),
      tripId: params.tripId,
    });
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "잘못된 입력입니다.", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const created: Place = { id: randomUUID(), ...parsed.data };
    places = [created, ...places];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/trips/:tripId/places/:id", async ({ params, request }) => {
    const body = await request.json();
    const parsed = updatePlaceInputSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "잘못된 입력입니다.", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const index = places.findIndex((p) => p.id === params.id && p.tripId === params.tripId);
    if (index === -1) {
      return HttpResponse.json({ message: "장소를 찾을 수 없습니다." }, { status: 404 });
    }
    places[index] = { ...places[index], ...parsed.data };
    return HttpResponse.json(places[index]);
  }),

  http.delete("/api/trips/:tripId/places/:id", async ({ params }) => {
    places = places.filter((p) => !(p.id === params.id && p.tripId === params.tripId));
    return new HttpResponse(null, { status: 204 });
  }),
];
