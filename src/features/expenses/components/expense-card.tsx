import { Button } from "@/components/ui/button";
import type { Expense } from "@/mocks/fixtures/expenses";

export function ExpenseCard({ expense, onDelete }: { expense: Expense; onDelete: () => void }) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-medium text-foreground">{expense.title}</p>
        <p className="text-xs text-muted-foreground">
          {expense.category} · {expense.paymentMethod}
          {expense.paidBy && ` · ${expense.paidBy}`}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-money">
          {expense.currency} {expense.amount.toLocaleString()}
        </span>
        <Button size="sm" variant="ghost" onClick={onDelete} aria-label={`${expense.title} 삭제`}>
          삭제
        </Button>
      </div>
    </div>
  );
}
