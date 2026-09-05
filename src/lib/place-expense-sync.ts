import type { Expense, ExpenseCategory } from "@/mocks/fixtures/expenses";
import type { Place, PlaceCategory } from "@/mocks/fixtures/places";

const CATEGORY_MAP: Record<PlaceCategory, ExpenseCategory> = {
  관광: "관광·입장",
  맛집: "식비",
  카페: "식비",
  쇼핑: "쇼핑",
  액티비티: "액티비티",
  기타: "기타",
};

export function mapPlaceCategoryToExpense(category: PlaceCategory): ExpenseCategory {
  return CATEGORY_MAP[category];
}

/** 사용자가 직접 고친 자동 항목은 다시 덮어쓰지 않는다 (docs/08 P7-05). */
export function canOverwriteExpense(existing: Expense | undefined): boolean {
  if (!existing) return true;
  return !existing.isManual;
}

export interface AutoExpenseDraft {
  tripId: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  currency: string;
  date: string;
  dayIndex: number | null;
  paymentMethod: "카드";
  paidBy: string;
  placeId: string;
  isManual: false;
}

export function buildAutoExpenseFromPlace(
  place: Place,
  fallbackCurrency: string,
  fallbackDate: string,
): AutoExpenseDraft | null {
  if (place.estimatedCost === undefined) return null;
  return {
    tripId: place.tripId,
    title: place.name,
    category: mapPlaceCategoryToExpense(place.category),
    amount: place.estimatedCost,
    currency: place.costCurrency ?? fallbackCurrency,
    date: fallbackDate,
    dayIndex: place.dayIndex,
    paymentMethod: "카드",
    paidBy: "나",
    placeId: place.id,
    isManual: false,
  };
}

export function findLinkedExpense(expenses: Expense[], placeId: string): Expense | undefined {
  return expenses.find((e) => e.placeId === placeId);
}
