import type { CreatePlaceInput, Place, UpdatePlaceInput } from "@/mocks/fixtures/places";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchPlaces(tripId: string): Promise<Place[]> {
  const res = await fetch(`/api/trips/${tripId}/places`);
  return parseJsonOrThrow<Place[]>(res);
}

export async function createPlace(input: CreatePlaceInput): Promise<Place> {
  const res = await fetch(`/api/trips/${input.tripId}/places`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<Place>(res);
}

export async function updatePlace(
  tripId: string,
  id: string,
  patch: UpdatePlaceInput,
): Promise<Place> {
  const res = await fetch(`/api/trips/${tripId}/places/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonOrThrow<Place>(res);
}

export async function deletePlace(tripId: string, id: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/places/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}
