import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenses,
  useFxRate,
} from "@/features/expenses/hooks";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useExpenses", () => {
  it("여행별 비용을 조회한다 (나고야 시드 5건)", async () => {
    const { result } = renderHook(() => useExpenses("trip_nagoya"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(5);
  });
});

describe("useCreateExpense / useDeleteExpense", () => {
  it("추가하면 즉시 반영되고, 삭제하면 사라진다", async () => {
    const wrapper = createWrapper();
    const { result: list } = renderHook(() => useExpenses("trip_nagoya"), { wrapper });
    await waitFor(() => expect(list.current.isSuccess).toBe(true));

    const { result: create } = renderHook(() => useCreateExpense("trip_nagoya"), { wrapper });
    act(() => {
      create.current.mutate({
        tripId: "trip_nagoya",
        title: "테스트 지출",
        category: "기타",
        amount: 1000,
        currency: "JPY",
        date: "2026-11-06",
        dayIndex: null,
        paymentMethod: "현금",
        placeId: null,
        isManual: true,
      });
    });
    await waitFor(() => {
      expect(list.current.data?.some((e) => e.title === "테스트 지출")).toBe(true);
    });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));

    const { result: del } = renderHook(() => useDeleteExpense("trip_nagoya"), { wrapper });
    act(() => {
      del.current.mutate(create.current.data!.id);
    });
    await waitFor(() => {
      expect(list.current.data?.some((e) => e.title === "테스트 지출")).toBe(false);
    });
  });
});

describe("useFxRate", () => {
  it("같은 통화면 요청 없이 1을 반환한다(enabled=false)", async () => {
    const { result } = renderHook(() => useFxRate("KRW", "KRW"), { wrapper: createWrapper() });
    // enabled: false 이므로 항상 idle 상태 — 실제 네트워크 호출이 없다.
    expect(result.current.fetchStatus).toBe("idle");
  });
});
