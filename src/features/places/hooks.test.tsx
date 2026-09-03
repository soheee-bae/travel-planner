import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import type { ReactNode } from "react";
import { server } from "@/mocks/server";
import { useCreatePlace, useDeletePlace, usePlaces, useUpdatePlace } from "@/features/places/hooks";

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("usePlaces", () => {
  it("여행별 장소를 조회한다 (나고야 시드 4건)", async () => {
    const { result } = renderHook(() => usePlaces("trip_nagoya"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.length).toBe(4);
  });

  it("미배정 장소(dayIndex=null)가 포함된다", async () => {
    const { result } = renderHook(() => usePlaces("trip_nagoya"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.some((p) => p.dayIndex === null)).toBe(true);
  });
});

describe("useCreatePlace / useUpdatePlace / useDeletePlace", () => {
  it("추가·수정·삭제가 즉시 목록에 반영된다", async () => {
    const wrapper = createWrapper();
    const { result: list } = renderHook(() => usePlaces("trip_nagoya"), { wrapper });
    await waitFor(() => expect(list.current.isSuccess).toBe(true));

    const { result: create } = renderHook(() => useCreatePlace("trip_nagoya"), { wrapper });
    act(() => {
      create.current.mutate({
        tripId: "trip_nagoya",
        name: "테스트 장소",
        category: "기타",
        priority: "가능하면",
        dayIndex: null,
        orderIndex: 0,
        tags: [],
      });
    });
    await waitFor(() => {
      expect(list.current.data?.some((p) => p.name === "테스트 장소")).toBe(true);
    });
    await waitFor(() => expect(create.current.isSuccess).toBe(true));
    const createdId = create.current.data!.id;

    const { result: update } = renderHook(() => useUpdatePlace("trip_nagoya"), { wrapper });
    act(() => {
      update.current.mutate({ id: createdId, patch: { dayIndex: 1 } });
    });
    await waitFor(() => {
      expect(list.current.data?.find((p) => p.id === createdId)?.dayIndex).toBe(1);
    });

    const { result: del } = renderHook(() => useDeletePlace("trip_nagoya"), { wrapper });
    act(() => {
      del.current.mutate(createdId);
    });
    await waitFor(() => {
      expect(list.current.data?.some((p) => p.id === createdId)).toBe(false);
    });
  });
});
