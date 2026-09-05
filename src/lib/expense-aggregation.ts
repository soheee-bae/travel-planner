import type { Expense } from "@/mocks/fixtures/expenses";

export interface CategoryShare {
  category: string;
  total: number;
  pct: number;
}

/** 합계는 프론트에서 매번 다시 계산하지 않고 이 함수들로만 만든다 — 항목
 * 하나를 고치면 이 값들도 자동으로 맞아야 한다(docs/06 §6.6). */
export function sumAmount(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function groupByCategory(expenses: Expense[]): CategoryShare[] {
  const total = sumAmount(expenses);
  const byCategory = new Map<string, number>();
  for (const e of expenses) {
    byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
  }
  return Array.from(byCategory.entries())
    .map(([category, categoryTotal]) => ({
      category,
      total: categoryTotal,
      pct: total > 0 ? Math.round((categoryTotal / total) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);
}

export function groupByDay(expenses: Expense[]): { dayIndex: number | null; total: number }[] {
  const byDay = new Map<number | null, number>();
  for (const e of expenses) {
    byDay.set(e.dayIndex, (byDay.get(e.dayIndex) ?? 0) + e.amount);
  }
  return Array.from(byDay.entries())
    .map(([dayIndex, total]) => ({ dayIndex, total }))
    .sort((a, b) => (a.dayIndex ?? Infinity) - (b.dayIndex ?? Infinity));
}

export function groupByPaymentMethod(expenses: Expense[]): { method: string; total: number }[] {
  const byMethod = new Map<string, number>();
  for (const e of expenses) {
    byMethod.set(e.paymentMethod, (byMethod.get(e.paymentMethod) ?? 0) + e.amount);
  }
  return Array.from(byMethod.entries())
    .map(([method, total]) => ({ method, total }))
    .sort((a, b) => b.total - a.total);
}

export function groupByPayer(expenses: Expense[]): { payer: string; total: number }[] {
  const byPayer = new Map<string, number>();
  for (const e of expenses) {
    const payer = e.paidBy ?? "미지정";
    byPayer.set(payer, (byPayer.get(payer) ?? 0) + e.amount);
  }
  return Array.from(byPayer.entries())
    .map(([payer, total]) => ({ payer, total }))
    .sort((a, b) => b.total - a.total);
}
