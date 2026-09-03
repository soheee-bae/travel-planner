import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import { useCreateTrip, useDeleteTrip, useTrip, useTrips } from "@/features/trips/hooks";

/**
 * P1-08 완료 조건("mock으로 CRUD 왕복이 동작")을 고정하는 회귀 테스트.
 * msw/node로 fetch를 가로채므로 실제 브라우저 없이 같은 핸들러를 검증한다.
 */
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useTrips", () => {
  it("초기 목 데이터를 불러온다", async () => {
    const { result } = renderHook(() => useTrips(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.map((t) => t.id)).toEqual(
      expect.arrayContaining(["trip_jeju", "trip_osaka", "trip_nagoya"]),
    );
  });
});

describe("useTrip", () => {
  it("id로 단건 조회한다", async () => {
    const { result } = renderHook(() => useTrip("trip_jeju"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe("제주도 여행");
  });

  it("존재하지 않는 id는 에러가 된다", async () => {
    const { result } = renderHook(() => useTrip("nope"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe("useCreateTrip / useDeleteTrip", () => {
  it("추가 시 낙관적으로 즉시 목록에 반영되고, 삭제하면 사라진다", async () => {
    const wrapper = createWrapper();
    const { result: listResult } = renderHook(() => useTrips(), { wrapper });
    await waitFor(() => expect(listResult.current.isSuccess).toBe(true));

    const { result: createResult } = renderHook(() => useCreateTrip(), { wrapper });
    act(() => {
      createResult.current.mutate({
        title: "테스트 여행",
        destinationCountry: "KR",
        destinationCity: "미정",
        startDate: "2026-12-01",
        endDate: "2026-12-03",
        companions: "혼자",
        coverEmoji: "✈️",
        baseCurrency: "KRW",
      });
    });

    // 서버 응답을 기다리지 않고도 즉시 반영되어야 한다 (optimistic update).
    await waitFor(() => {
      expect(listResult.current.data?.some((t) => t.title === "테스트 여행")).toBe(true);
    });
    await waitFor(() => expect(createResult.current.isSuccess).toBe(true));

    const createdId = createResult.current.data?.id;
    expect(createdId).toBeDefined();

    const { result: deleteResult } = renderHook(() => useDeleteTrip(), { wrapper });
    act(() => {
      deleteResult.current.mutate(createdId!);
    });

    await waitFor(() => {
      expect(listResult.current.data?.some((t) => t.title === "테스트 여행")).toBe(false);
    });
  });
});
