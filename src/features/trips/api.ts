import type { CreateTripInput, Trip } from "@/mocks/fixtures/trips";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchTrips(): Promise<Trip[]> {
  const res = await fetch("/api/trips");
  return parseJsonOrThrow<Trip[]>(res);
}

export async function fetchTrip(id: string): Promise<Trip> {
  const res = await fetch(`/api/trips/${id}`);
  return parseJsonOrThrow<Trip>(res);
}

export async function createTrip(input: CreateTripInput): Promise<Trip> {
  const res = await fetch("/api/trips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<Trip>(res);
}

export async function deleteTrip(id: string): Promise<void> {
  const res = await fetch(`/api/trips/${id}`, { method: "DELETE" });
  if (!res.ok) {
    throw new Error(`삭제 실패 (${res.status})`);
  }
}
