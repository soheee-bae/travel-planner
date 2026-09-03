import type {
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
  WishlistItem,
} from "@/mocks/fixtures/wishlist";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchWishlist(tripId: string): Promise<WishlistItem[]> {
  const res = await fetch(`/api/trips/${tripId}/wishlist`);
  return parseJsonOrThrow<WishlistItem[]>(res);
}

export async function createWishlistItem(input: CreateWishlistItemInput): Promise<WishlistItem> {
  const res = await fetch(`/api/trips/${input.tripId}/wishlist`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<WishlistItem>(res);
}

export async function updateWishlistItem(
  tripId: string,
  id: string,
  patch: UpdateWishlistItemInput,
): Promise<WishlistItem> {
  const res = await fetch(`/api/trips/${tripId}/wishlist/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parseJsonOrThrow<WishlistItem>(res);
}

export async function deleteWishlistItem(tripId: string, id: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/wishlist/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}
