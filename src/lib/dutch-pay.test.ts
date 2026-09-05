import { describe, expect, it } from "vitest";
import { settleEvenly } from "@/lib/dutch-pay";
import type { Expense } from "@/mocks/fixtures/expenses";

function exp(amount: number, paidBy?: string): Expense {
  return {
    id: `e-${amount}-${paidBy ?? "x"}`,
    tripId: "trip_x",
    title: "항목",
    category: "식비",
    amount,
    currency: "JPY",
    date: "2026-01-01",
    dayIndex: 1,
    paymentMethod: "카드",
    paidBy,
    placeId: null,
    isManual: true,
  };
}

describe("settleEvenly", () => {
  it("빈 배열은 빈 정산", () => {
    expect(settleEvenly([])).toEqual([]);
  });

  it("한 명만 냈으면 잔액이 0이다", () => {
    const result = settleEvenly([exp(1000, "나")]);
    expect(result).toEqual([{ payer: "나", paid: 1000, share: 1000, balance: 0 }]);
  });

  it("두 명이 다르게 냈으면 차액을 계산한다", () => {
    const result = settleEvenly([exp(3000, "나"), exp(1000, "친구")]);
    expect(result).toEqual([
      { payer: "나", paid: 3000, share: 2000, balance: 1000 },
      { payer: "친구", paid: 1000, share: 2000, balance: -1000 },
    ]);
  });

  it("결제자가 없으면 미지정으로 묶는다", () => {
    expect(settleEvenly([exp(500)])).toEqual([
      { payer: "미지정", paid: 500, share: 500, balance: 0 },
    ]);
  });
});
