import { queryOptions } from "@tanstack/react-query";
import { fetchExpenses, fetchFxRate } from "@/features/expenses/api";

export const expensesKeys = {
  all: (tripId: string) => ["trips", tripId, "expenses"] as const,
};

export const expensesQueryOptions = (tripId: string) =>
  queryOptions({
    queryKey: expensesKeys.all(tripId),
    queryFn: () => fetchExpenses(tripId),
  });

export const fxRateQueryOptions = (from: string, to: string) =>
  queryOptions({
    queryKey: ["fx", from, to] as const,
    queryFn: () => fetchFxRate(from, to),
    enabled: from !== to,
    staleTime: 60 * 60 * 1000, // 1시간 — 환율은 하루 1회만 갱신된다
  });
