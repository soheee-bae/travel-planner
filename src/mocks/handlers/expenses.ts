import { http, HttpResponse } from "msw";
import { randomUUID } from "@/lib/id";
import {
  createExpenseInputSchema,
  initialExpenses,
  updateExpenseInputSchema,
  type Expense,
} from "@/mocks/fixtures/expenses";

let expenses: Expense[] = [...initialExpenses];

export const expensesHandlers = [
  http.get("/api/trips/:tripId/expenses", async ({ params }) => {
    return HttpResponse.json(expenses.filter((e) => e.tripId === params.tripId));
  }),

  http.post("/api/trips/:tripId/expenses", async ({ params, request }) => {
    const body = await request.json();
    const parsed = createExpenseInputSchema.safeParse({
      ...(body as object),
      tripId: params.tripId,
    });
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "잘못된 입력입니다.", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const created: Expense = { id: randomUUID(), ...parsed.data };
    expenses = [created, ...expenses];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/trips/:tripId/expenses/:id", async ({ params, request }) => {
    const body = await request.json();
    const parsed = updateExpenseInputSchema.safeParse(body);
    if (!parsed.success) {
      return HttpResponse.json(
        { message: "잘못된 입력입니다.", issues: parsed.error.issues },
        { status: 400 },
      );
    }
    const index = expenses.findIndex((e) => e.id === params.id && e.tripId === params.tripId);
    if (index === -1) {
      return HttpResponse.json({ message: "비용을 찾을 수 없습니다." }, { status: 404 });
    }
    expenses[index] = { ...expenses[index], ...parsed.data };
    return HttpResponse.json(expenses[index]);
  }),

  http.delete("/api/trips/:tripId/expenses/:id", async ({ params }) => {
    expenses = expenses.filter((e) => !(e.id === params.id && e.tripId === params.tripId));
    return new HttpResponse(null, { status: 204 });
  }),
];
