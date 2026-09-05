import { describe, expect, it } from "vitest";
import {
  buildAutoExpenseFromPlace,
  canOverwriteExpense,
  findLinkedExpense,
  mapPlaceCategoryToExpense,
} from "@/lib/place-expense-sync";
import type { Expense } from "@/mocks/fixtures/expenses";
import type { Place } from "@/mocks/fixtures/places";

function place(overrides: Partial<Place> = {}): Place {
  return {
    id: "p1",
    tripId: "trip_x",
    name: "카페",
    category: "카페",
    estimatedCost: 800,
    costCurrency: "JPY",
    priority: "가능하면",
    dayIndex: 1,
    orderIndex: 0,
    tags: [],
    ...overrides,
  };
}

function expense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: "e1",
    tripId: "trip_x",
    title: "카페",
    category: "식비",
    amount: 800,
    currency: "JPY",
    date: "2026-01-01",
    dayIndex: 1,
    paymentMethod: "카드",
    placeId: "p1",
    isManual: false,
    ...overrides,
  };
}

describe("mapPlaceCategoryToExpense", () => {
  it("장소 카테고리를 비용 카테고리로 대응한다", () => {
    expect(mapPlaceCategoryToExpense("관광")).toBe("관광·입장");
    expect(mapPlaceCategoryToExpense("맛집")).toBe("식비");
    expect(mapPlaceCategoryToExpense("카페")).toBe("식비");
  });
});

describe("canOverwriteExpense", () => {
  it("연결된 항목이 없으면 생성해도 된다", () => {
    expect(canOverwriteExpense(undefined)).toBe(true);
  });

  it("자동 생성 항목은 덮어쓸 수 있다", () => {
    expect(canOverwriteExpense(expense({ isManual: false }))).toBe(true);
  });

  it("사용자가 수정한 항목은 덮어쓰지 않는다", () => {
    expect(canOverwriteExpense(expense({ isManual: true, amount: 1200 }))).toBe(false);
  });
});

describe("buildAutoExpenseFromPlace", () => {
  it("예상비용이 없으면 null", () => {
    expect(
      buildAutoExpenseFromPlace(place({ estimatedCost: undefined }), "KRW", "2026-01-01"),
    ).toBe(null);
  });

  it("예상비용이 있으면 isManual=false 초안을 만든다", () => {
    const draft = buildAutoExpenseFromPlace(place(), "KRW", "2026-01-01");
    expect(draft).toMatchObject({
      amount: 800,
      currency: "JPY",
      category: "식비",
      placeId: "p1",
      isManual: false,
    });
  });
});

describe("findLinkedExpense", () => {
  it("placeId로 연결 비용을 찾는다", () => {
    const found = findLinkedExpense([expense(), expense({ id: "e2", placeId: "p2" })], "p1");
    expect(found?.id).toBe("e1");
  });
});
