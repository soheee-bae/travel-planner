"use client";

import { useMemo, useState } from "react";
import {
  groupByCategory,
  groupByDay,
  groupByPayer,
  groupByPaymentMethod,
  sumAmount,
} from "@/lib/expense-aggregation";
import { settleEvenly } from "@/lib/dutch-pay";
import { useDeleteExpense, useExpenses, useFxRate } from "@/features/expenses/hooks";
import { BudgetDonutChart } from "@/features/expenses/components/budget-donut-chart";
import { ExpenseCard } from "@/features/expenses/components/expense-card";
import { AddExpenseDialog } from "@/features/expenses/components/add-expense-dialog";
import { cn } from "@/lib/utils";
import type { Trip } from "@/mocks/fixtures/trips";

type GroupMode = "day" | "category" | "method" | "payer";
const GROUP_LABELS: Record<GroupMode, string> = {
  day: "Day별",
  category: "카테고리별",
  method: "결제수단별",
  payer: "결제자별",
};

export function BudgetTab({ trip }: { trip: Trip }) {
  const { data: expenses, isLoading, isError } = useExpenses(trip.id);
  const deleteExpense = useDeleteExpense(trip.id);
  const [group, setGroup] = useState<GroupMode>("day");

  const homeCurrency = "KRW";
  const { data: fx } = useFxRate(trip.baseCurrency, homeCurrency);

  const total = useMemo(() => sumAmount(expenses ?? []), [expenses]);
  const categoryShares = useMemo(() => groupByCategory(expenses ?? []), [expenses]);

  const settlements = useMemo(() => settleEvenly(expenses ?? []), [expenses]);

  const grouped = useMemo(() => {
    if (!expenses) return [];
    if (group === "day")
      return groupByDay(expenses).map((g) => ({
        label: g.dayIndex ? `Day${g.dayIndex}` : "날짜 미지정",
        total: g.total,
      }));
    if (group === "category")
      return groupByCategory(expenses).map((g) => ({ label: g.category, total: g.total }));
    if (group === "method")
      return groupByPaymentMethod(expenses).map((g) => ({ label: g.method, total: g.total }));
    return groupByPayer(expenses).map((g) => ({ label: g.payer, total: g.total }));
  }, [expenses, group]);

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">불러오는 중…</p>;
  if (isError)
    return <p className="p-6 text-sm text-destructive">비용 정보를 불러오지 못했습니다.</p>;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="rounded-lg border border-border bg-money-surface p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">💰 총 비용</span>
          <span className="text-lg font-bold text-money">
            {trip.baseCurrency} {total.toLocaleString()}
          </span>
        </div>
        {fx && fx.rate !== 1 && (
          <p className="mt-1 text-right text-xs text-muted-foreground">
            ≈ ₩{Math.round((total * fx.rate) / 100) * 100}
            {fx.date && ` (환율 기준일: ${fx.date})`}
          </p>
        )}
      </div>

      {categoryShares.length > 0 && <BudgetDonutChart data={categoryShares} />}

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {(Object.keys(GROUP_LABELS) as GroupMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setGroup(mode)}
              className={cn(
                "shrink-0 rounded-md px-2.5 py-1 text-xs font-medium whitespace-nowrap",
                group === mode
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {GROUP_LABELS[mode]}
            </button>
          ))}
        </div>
        <AddExpenseDialog tripId={trip.id} currency={trip.baseCurrency} />
      </div>

      <div className="flex flex-col gap-2">
        {grouped.map((g) => (
          <div
            key={g.label}
            className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
          >
            <span className="text-sm text-foreground">{g.label}</span>
            <span className="text-sm font-medium text-money">
              {trip.baseCurrency} {g.total.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {settlements.length > 1 && (
        <section
          aria-labelledby="dutch-pay-heading"
          className="rounded-lg border border-border p-4"
        >
          <h2 id="dutch-pay-heading" className="mb-2 text-sm font-medium text-foreground">
            더치페이 정산
          </h2>
          <ul className="flex flex-col gap-2">
            {settlements.map((row) => (
              <li key={row.payer} className="flex items-center justify-between text-sm">
                <span>{row.payer}</span>
                <span className={row.balance >= 0 ? "text-money" : "text-destructive"}>
                  {row.balance >= 0
                    ? `${trip.baseCurrency} ${Math.round(row.balance).toLocaleString()} 받음`
                    : `${trip.baseCurrency} ${Math.round(Math.abs(row.balance)).toLocaleString()} 더 냄`}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col gap-2">
        {expenses?.length === 0 && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            비용을 입력하면 자동으로 합계가 나와요
          </p>
        )}
        {expenses?.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onDelete={() => deleteExpense.mutate(expense.id)}
          />
        ))}
      </div>
    </div>
  );
}
