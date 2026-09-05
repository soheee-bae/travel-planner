import type { Expense } from "@/mocks/fixtures/expenses";
import { sumAmount } from "@/lib/expense-aggregation";

export interface Settlement {
  payer: string;
  paid: number;
  share: number;
  /** 양수면 받아야 하고, 음수면 더 내야 한다. */
  balance: number;
}

/**
 * 결제자별 더치페이. 인원수는 실제 결제자 목록에서 파생한다 —
 * companions 문자열이 인원 수가 아니기 때문이다.
 */
export function settleEvenly(expenses: Expense[]): Settlement[] {
  const payers = new Map<string, number>();
  for (const e of expenses) {
    const payer = e.paidBy?.trim() ? e.paidBy.trim() : "미지정";
    payers.set(payer, (payers.get(payer) ?? 0) + e.amount);
  }

  const names = Array.from(payers.keys()).sort((a, b) => a.localeCompare(b, "ko"));
  if (names.length === 0) return [];

  const total = sumAmount(expenses);
  const share = total / names.length;

  return names
    .map((payer) => {
      const paid = payers.get(payer) ?? 0;
      return { payer, paid, share, balance: paid - share };
    })
    .sort((a, b) => b.paid - a.paid);
}
