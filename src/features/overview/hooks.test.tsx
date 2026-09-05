import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import {
  useAccommodations,
  useCreateAccommodation,
  useCreateTransport,
  useDeleteAccommodation,
  useTransports,
} from "@/features/overview/hooks";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("accommodations", () => {
  it("여행별 숙소를 조회하고, 추가하면 즉시 반영되며 삭제하면 사라진다", async () => {
    const wrapper = createWrapper();
    const { result: list } = renderHook(() => useAccommodations("trip_nagoya"), { wrapper });
    await waitFor(() => expect(list.current.isSuccess).toBe(true));
    expect(list.current.data?.some((a) => a.name.includes("악텔"))).toBe(true);

    const { result: create } = renderHook(() => useCreateAccommodation("trip_nagoya"), {
      wrapper,
    });
    act(() => {
      create.current.mutate({
        tripId: "trip_nagoya",
        name: "테스트 호텔",
        checkinDate: "2026-11-06",
        checkoutDate: "2026-11-08",
      });
    });
    await waitFor(() => {
      expect(list.current.data?.some((a) => a.name === "테스트 호텔")).toBe(true);
    });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));

    const createdId = create.current.data?.id;
    const { result: del } = renderHook(() => useDeleteAccommodation("trip_nagoya"), { wrapper });
    act(() => {
      del.current.mutate(createdId!);
    });
    await waitFor(() => {
      expect(list.current.data?.some((a) => a.name === "테스트 호텔")).toBe(false);
    });
  });

  it("다른 여행의 숙소는 섞이지 않는다", async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAccommodations("trip_jeju"), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([]);
  });
});

describe("transports", () => {
  it("여행별 교통편을 조회하고, 추가하면 즉시 반영된다", async () => {
    const wrapper = createWrapper();
    const { result: list } = renderHook(() => useTransports("trip_nagoya"), { wrapper });
    await waitFor(() => expect(list.current.isSuccess).toBe(true));
    expect(list.current.data?.length).toBeGreaterThanOrEqual(2);

    const { result: create } = renderHook(() => useCreateTransport("trip_nagoya"), { wrapper });
    act(() => {
      create.current.mutate({
        tripId: "trip_nagoya",
        type: "KTX",
        departureFrom: "서울",
        arrivalTo: "부산",
        departureAt: "2026-11-06T08:00",
        arrivalAt: "2026-11-06T10:30",
      });
    });
    await waitFor(() => {
      expect(list.current.data?.some((t) => t.departureFrom === "서울")).toBe(true);
    });
  });
});
