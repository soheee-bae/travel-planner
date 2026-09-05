import { describe, expect, it } from "vitest";
import {
  groupByCategory,
  groupByDay,
  groupByPayer,
  groupByPaymentMethod,
  sumAmount,
} from "@/lib/expense-aggregation";
import type { Expense } from "@/mocks/fixtures/expenses";

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: "e1",
    tripId: "trip_x",
    title: "테스트",
    category: "식비",
    amount: 1000,
    currency: "JPY",
    date: "2026-01-01",
    dayIndex: 1,
    paymentMethod: "카드",
    paidBy: "나",
    placeId: null,
    isManual: true,
    ...overrides,
  };
}

describe("sumAmount", () => {
  it("전체 금액을 합산한다", () => {
    const expenses = [makeExpense({ amount: 1000 }), makeExpense({ amount: 2000 })];
    expect(sumAmount(expenses)).toBe(3000);
  });

  it("빈 배열은 0", () => {
    expect(sumAmount([])).toBe(0);
  });
});

describe("groupByCategory", () => {
  it("카테고리별로 합산하고 퍼센트를 계산한다", () => {
    const expenses = [
      makeExpense({ category: "식비", amount: 6000 }),
      makeExpense({ category: "교통", amount: 4000 }),
    ];
    const result = groupByCategory(expenses);
    expect(result).toEqual([
      { category: "식비", total: 6000, pct: 60 },
      { category: "교통", total: 4000, pct: 40 },
    ]);
  });

  it("합계가 큰 순서로 정렬된다", () => {
    const expenses = [
      makeExpense({ category: "쇼핑", amount: 100 }),
      makeExpense({ category: "식비", amount: 900 }),
    ];
    expect(groupByCategory(expenses).map((g) => g.category)).toEqual(["식비", "쇼핑"]);
  });
});

describe("groupByDay", () => {
  it("Day별로 합산하고 순서대로 정렬한다 (미지정은 마지막)", () => {
    const expenses = [
      makeExpense({ dayIndex: 2, amount: 100 }),
      makeExpense({ dayIndex: 1, amount: 200 }),
      makeExpense({ dayIndex: null, amount: 50 }),
    ];
    expect(groupByDay(expenses)).toEqual([
      { dayIndex: 1, total: 200 },
      { dayIndex: 2, total: 100 },
      { dayIndex: null, total: 50 },
    ]);
  });
});

describe("groupByPaymentMethod / groupByPayer", () => {
  it("결제수단별로 합산한다", () => {
    const expenses = [
      makeExpense({ paymentMethod: "카드", amount: 100 }),
      makeExpense({ paymentMethod: "현금", amount: 200 }),
      makeExpense({ paymentMethod: "카드", amount: 50 }),
    ];
    expect(groupByPaymentMethod(expenses)).toEqual([
      { method: "현금", total: 200 },
      { method: "카드", total: 150 },
    ]);
  });

  it("결제자가 없으면 미지정으로 묶인다", () => {
    const expenses = [makeExpense({ paidBy: undefined, amount: 100 })];
    expect(groupByPayer(expenses)).toEqual([{ payer: "미지정", total: 100 }]);
  });
});
