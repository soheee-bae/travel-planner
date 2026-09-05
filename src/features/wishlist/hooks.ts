import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWishlistItem,
  deleteWishlistItem,
  updateWishlistItem,
} from "@/features/wishlist/api";
import { wishlistKeys, wishlistQueryOptions } from "@/features/wishlist/queries";
import { randomUUID } from "@/lib/id";
import type {
  CreateWishlistItemInput,
  UpdateWishlistItemInput,
  WishlistItem,
} from "@/mocks/fixtures/wishlist";

export function useWishlist(tripId: string) {
  return useQuery(wishlistQueryOptions(tripId));
}

export function useCreateWishlistItem(tripId: string) {
  const queryClient = useQueryClient();
  const key = wishlistKeys.all(tripId);

  return useMutation({
    mutationFn: createWishlistItem,
    onMutate: async (input: CreateWishlistItemInput) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<WishlistItem[]>(key);
      const optimistic: WishlistItem = { id: `temp_${randomUUID()}`, ...input };
      queryClient.setQueryData<WishlistItem[]>(key, (old) => [...(old ?? []), optimistic]);
      return { previous };
    },
    onError: (_err, _input, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useUpdateWishlistItem(tripId: string) {
  const queryClient = useQueryClient();
  const key = wishlistKeys.all(tripId);

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: UpdateWishlistItemInput }) =>
      updateWishlistItem(tripId, id, patch),
    onMutate: async ({ id, patch }) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<WishlistItem[]>(key);
      queryClient.setQueryData<WishlistItem[]>(key, (old) =>
        (old ?? []).map((i) => (i.id === id ? { ...i, ...patch } : i)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useDeleteWishlistItem(tripId: string) {
  const queryClient = useQueryClient();
  const key = wishlistKeys.all(tripId);

  return useMutation({
    mutationFn: (id: string) => deleteWishlistItem(tripId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<WishlistItem[]>(key);
      queryClient.setQueryData<WishlistItem[]>(key, (old) =>
        (old ?? []).filter((i) => i.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });
}
