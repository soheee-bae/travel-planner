import type {
  Accommodation,
  CreateAccommodationInput,
  CreateTransportInput,
  Transport,
} from "@/mocks/fixtures/overview";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchAccommodations(tripId: string): Promise<Accommodation[]> {
  const res = await fetch(`/api/trips/${tripId}/accommodations`);
  return parseJsonOrThrow<Accommodation[]>(res);
}

export async function createAccommodation(input: CreateAccommodationInput): Promise<Accommodation> {
  const res = await fetch(`/api/trips/${input.tripId}/accommodations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<Accommodation>(res);
}

export async function deleteAccommodation(tripId: string, id: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/accommodations/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}

export async function fetchTransports(tripId: string): Promise<Transport[]> {
  const res = await fetch(`/api/trips/${tripId}/transports`);
  return parseJsonOrThrow<Transport[]>(res);
}

export async function createTransport(input: CreateTransportInput): Promise<Transport> {
  const res = await fetch(`/api/trips/${input.tripId}/transports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<Transport>(res);
}

export async function deleteTransport(tripId: string, id: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/transports/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}
