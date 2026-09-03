import type { CreateExpenseInput, Expense } from "@/mocks/fixtures/expenses";

async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `요청 실패 (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export async function fetchExpenses(tripId: string): Promise<Expense[]> {
  const res = await fetch(`/api/trips/${tripId}/expenses`);
  return parseJsonOrThrow<Expense[]>(res);
}

export async function createExpense(input: CreateExpenseInput): Promise<Expense> {
  const res = await fetch(`/api/trips/${input.tripId}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseJsonOrThrow<Expense>(res);
}

export async function deleteExpense(tripId: string, id: string): Promise<void> {
  const res = await fetch(`/api/trips/${tripId}/expenses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`삭제 실패 (${res.status})`);
}

export interface FxRate {
  from: string;
  to: string;
  rate: number;
  date: string | null;
}

export async function fetchFxRate(from: string, to: string): Promise<FxRate> {
  const res = await fetch(`/api/currency?from=${from}&to=${to}`);
  return parseJsonOrThrow<FxRate>(res);
}
