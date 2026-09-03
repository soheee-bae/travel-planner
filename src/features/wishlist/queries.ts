import { queryOptions } from "@tanstack/react-query";
import { fetchWishlist } from "@/features/wishlist/api";

export const wishlistKeys = {
  all: (tripId: string) => ["trips", tripId, "wishlist"] as const,
};

export const wishlistQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: wishlistKeys.all(tripId),
    queryFn: () => fetchWishlist(tripId),
  });
