import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import {
  useCreateWishlistItem,
  useDeleteWishlistItem,
  useUpdateWishlistItem,
  useWishlist,
} from "@/features/wishlist/hooks";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("wishlist", () => {
  it("나고야 여행에 시드 메모 3건이 있다", async () => {
    const { result } = renderHook(() => useWishlist("trip_nagoya"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(3);
  });

  it("추가·수정·삭제가 즉시 반영된다", async () => {
    const wrapper = createWrapper();
    const { result: list } = renderHook(() => useWishlist("trip_nagoya"), { wrapper });
    await waitFor(() => expect(list.current.isSuccess).toBe(true));

    const { result: create } = renderHook(() => useCreateWishlistItem("trip_nagoya"), {
      wrapper,
    });
    act(() => {
      create.current.mutate({
        tripId: "trip_nagoya",
        icon: "📝",
        title: "테스트 메모",
        orderIndex: 3,
      });
    });
    await waitFor(() => {
      expect(list.current.data?.some((i) => i.title === "테스트 메모")).toBe(true);
    });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));
    const createdId = create.current.data!.id;

    const { result: update } = renderHook(() => useUpdateWishlistItem("trip_nagoya"), {
      wrapper,
    });
    act(() => {
      update.current.mutate({ id: createdId, patch: { title: "수정된 메모" } });
    });
    await waitFor(() => {
      expect(list.current.data?.find((i) => i.id === createdId)?.title).toBe("수정된 메모");
    });

    const { result: del } = renderHook(() => useDeleteWishlistItem("trip_nagoya"), { wrapper });
    act(() => {
      del.current.mutate(createdId);
    });
    await waitFor(() => {
      expect(list.current.data?.some((i) => i.id === createdId)).toBe(false);
    });
  });
});
