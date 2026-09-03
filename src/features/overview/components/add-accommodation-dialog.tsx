"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateAccommodation } from "@/features/overview/hooks";
import {
  createAccommodationInputSchema,
  type CreateAccommodationInput,
} from "@/mocks/fixtures/overview";

const formSchema = createAccommodationInputSchema.omit({ tripId: true });
type FormValues = z.infer<typeof formSchema>;

export function AddAccommodationDialog({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const createAccommodation = useCreateAccommodation(tripId);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", checkinDate: "", checkoutDate: "" },
  });

  function onSubmit(values: FormValues) {
    const input: CreateAccommodationInput = { tripId, ...values };
    createAccommodation.mutate(input, { onSuccess: () => setOpen(false) });
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="size-4" aria-hidden="true" />
          숙소 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>숙소 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-name">숙소명</Label>
            <Input id="acc-name" placeholder="예: 제주 신라호텔" {...form.register("name")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acc-checkin">체크인</Label>
              <Input id="acc-checkin" type="date" {...form.register("checkinDate")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acc-checkout">체크아웃</Label>
              <Input id="acc-checkout" type="date" {...form.register("checkoutDate")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acc-checkin-time">체크인 시간</Label>
              <Input id="acc-checkin-time" type="time" {...form.register("checkinTime")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="acc-checkout-time">체크아웃 시간</Label>
              <Input id="acc-checkout-time" type="time" {...form.register("checkoutTime")} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="acc-cost">비용</Label>
            <Input
              id="acc-cost"
              type="number"
              min={0}
              {...form.register("cost", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              })}
            />
          </div>
          <Button type="submit" className="h-10" disabled={createAccommodation.isPending}>
            추가
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
