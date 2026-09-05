import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import {
  useChecklistCategories,
  useChecklistItems,
  useCreateChecklistCategory,
  useUpdateChecklistItem,
} from "@/features/checklists/hooks";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("checklists", () => {
  it("나고야 여행에 기본 카테고리 5종이 시드되어 있다", async () => {
    const { result } = renderHook(() => useChecklistCategories("trip_nagoya"), {
      wrapper: createWrapper(),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(5);
    expect(result.current.data?.map((c) => c.name)).toContain("예약 관련");
  });

  it("항목 체크를 토글하면 즉시 반영된다", async () => {
    const wrapper = createWrapper();
    const { result: items } = renderHook(() => useChecklistItems("trip_nagoya"), { wrapper });
    await waitFor(() => expect(items.current.isSuccess).toBe(true));
    const target = items.current.data!.find((i) => !i.isChecked)!;

    const { result: update } = renderHook(() => useUpdateChecklistItem("trip_nagoya"), {
      wrapper,
    });
    act(() => {
      update.current.mutate({ id: target.id, patch: { isChecked: true } });
    });

    await waitFor(() => {
      expect(items.current.data?.find((i) => i.id === target.id)?.isChecked).toBe(true);
    });
  });

  it("새 카테고리를 추가하면 목록에 즉시 나타난다", async () => {
    const wrapper = createWrapper();
    const { result: categories } = renderHook(() => useChecklistCategories("trip_nagoya"), {
      wrapper,
    });
    await waitFor(() => expect(categories.current.isSuccess).toBe(true));

    const { result: create } = renderHook(() => useCreateChecklistCategory("trip_nagoya"), {
      wrapper,
    });
    act(() => {
      create.current.mutate({
        tripId: "trip_nagoya",
        name: "쇼핑리스트",
        icon: "🛍️",
        orderIndex: 5,
      });
    });

    await waitFor(() => {
      expect(categories.current.data?.some((c) => c.name === "쇼핑리스트")).toBe(true);
    });
  });
});
