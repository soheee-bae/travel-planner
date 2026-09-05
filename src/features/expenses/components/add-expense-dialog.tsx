"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateExpense } from "@/features/expenses/hooks";
import {
  createExpenseInputSchema,
  EXPENSE_CATEGORIES,
  PAYMENT_METHODS,
  type CreateExpenseInput,
} from "@/mocks/fixtures/expenses";
import { z } from "zod";

const formSchema = createExpenseInputSchema.omit({
  tripId: true,
  dayIndex: true,
  placeId: true,
  isManual: true,
});
type FormValues = z.infer<typeof formSchema>;

export function AddExpenseDialog({ tripId, currency }: { tripId: string; currency: string }) {
  const [open, setOpen] = useState(false);
  const createExpense = useCreateExpense(tripId);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "식비",
      amount: 0,
      currency,
      date: "",
      paymentMethod: "카드",
      paidBy: "",
    },
  });

  function onSubmit(values: FormValues) {
    const input: CreateExpenseInput = {
      tripId,
      dayIndex: null,
      placeId: null,
      isManual: true,
      ...values,
    };
    createExpense.mutate(input, { onSuccess: () => setOpen(false) });
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="size-4" aria-hidden="true" />
          비용 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>비용 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exp-title">항목명</Label>
            <Input id="exp-title" placeholder="예: 우진해장국 점심" {...form.register("title")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="exp-category">카테고리</Label>
            <Select
              defaultValue={form.getValues("category")}
              onValueChange={(v) => form.setValue("category", v as FormValues["category"])}
            >
              <SelectTrigger id="exp-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exp-amount">금액</Label>
              <Input
                id="exp-amount"
                type="number"
                min={0}
                {...form.register("amount", { setValueAs: (v) => (v === "" ? 0 : Number(v)) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exp-date">날짜</Label>
              <Input id="exp-date" type="date" {...form.register("date")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exp-method">결제수단</Label>
              <Select
                defaultValue={form.getValues("paymentMethod")}
                onValueChange={(v) =>
                  form.setValue("paymentMethod", v as FormValues["paymentMethod"])
                }
              >
                <SelectTrigger id="exp-method" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="exp-paidby">결제자</Label>
              <Input id="exp-paidby" placeholder="나" {...form.register("paidBy")} />
            </div>
          </div>
          <Button type="submit" className="h-10" disabled={createExpense.isPending}>
            추가
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
