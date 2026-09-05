import { z } from "zod";

export const EXPENSE_CATEGORIES = [
  "식비",
  "숙소",
  "교통",
  "관광·입장",
  "쇼핑",
  "항공",
  "통신",
  "액티비티",
  "기타",
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const PAYMENT_METHODS = ["현금", "카드", "선불"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** 계획서 v2의 비용 property 11개 전부 담는다(docs/08 P7-01). */
export const expenseSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  title: z.string().min(1).max(120),
  category: z.enum(EXPENSE_CATEGORIES),
  amount: z.number().nonnegative(),
  currency: z.string().min(3).max(3),
  date: z.string(), // yyyy-mm-dd
  dayIndex: z.number().int().positive().nullable(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  paidBy: z.string().optional(),
  placeId: z.string().nullable(),
  memo: z.string().optional(),
  isManual: z.boolean(),
});
export type Expense = z.infer<typeof expenseSchema>;

export const createExpenseInputSchema = expenseSchema.omit({ id: true });
export type CreateExpenseInput = z.infer<typeof createExpenseInputSchema>;

export const updateExpenseInputSchema = expenseSchema.omit({ id: true, tripId: true }).partial();
export type UpdateExpenseInput = z.infer<typeof updateExpenseInputSchema>;

export const initialExpenses: Expense[] = [
  {
    id: "exp_nagoya_1",
    tripId: "trip_nagoya",
    title: "아츠타 호라이켄 히츠마부시",
    category: "식비",
    amount: 4600,
    currency: "JPY",
    date: "2026-11-06",
    dayIndex: 1,
    paymentMethod: "카드",
    paidBy: "나",
    placeId: "place_nagoya_2",
    isManual: false,
  },
  {
    id: "exp_nagoya_2",
    tripId: "trip_nagoya",
    title: "코메다 커피",
    category: "식비",
    amount: 800,
    currency: "JPY",
    date: "2026-11-07",
    dayIndex: 2,
    paymentMethod: "카드",
    paidBy: "나",
    placeId: "place_nagoya_3",
    isManual: false,
  },
  {
    id: "exp_nagoya_3",
    tripId: "trip_nagoya",
    title: "지브리 파크 입장권",
    category: "관광·입장",
    amount: 3500,
    currency: "JPY",
    date: "2026-11-07",
    dayIndex: 2,
    paymentMethod: "카드",
    paidBy: "나",
    placeId: "place_nagoya_1",
    isManual: false,
  },
  {
    id: "exp_nagoya_4",
    tripId: "trip_nagoya",
    title: "지하철 1일 승차권",
    category: "교통",
    amount: 760,
    currency: "JPY",
    date: "2026-11-07",
    dayIndex: 2,
    paymentMethod: "현금",
    paidBy: "나",
    placeId: null,
    isManual: true,
  },
  {
    id: "exp_nagoya_5",
    tripId: "trip_nagoya",
    title: "오스카상점가 기념품",
    category: "쇼핑",
    amount: 2800,
    currency: "JPY",
    date: "2026-11-06",
    dayIndex: 1,
    paymentMethod: "카드",
    paidBy: "나",
    placeId: null,
    isManual: true,
  },
];
