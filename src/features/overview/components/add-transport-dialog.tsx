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
import { useCreateTransport } from "@/features/overview/hooks";
import {
  createTransportInputSchema,
  TRANSPORT_TYPES,
  type CreateTransportInput,
} from "@/mocks/fixtures/overview";

const formSchema = createTransportInputSchema.omit({ tripId: true });
type FormValues = z.infer<typeof formSchema>;

export function AddTransportDialog({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const createTransport = useCreateTransport(tripId);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "비행기",
      departureFrom: "",
      arrivalTo: "",
      departureAt: "",
      arrivalAt: "",
    },
  });

  function onSubmit(values: FormValues) {
    const input: CreateTransportInput = { tripId, ...values };
    createTransport.mutate(input, { onSuccess: () => setOpen(false) });
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="size-4" aria-hidden="true" />
          교통편 추가
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>교통편 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tr-type">유형</Label>
            <Select
              defaultValue={form.getValues("type")}
              onValueChange={(v) => form.setValue("type", v as FormValues["type"])}
            >
              <SelectTrigger id="tr-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TRANSPORT_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tr-from">출발지</Label>
              <Input id="tr-from" placeholder="예: 김포" {...form.register("departureFrom")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tr-to">도착지</Label>
              <Input id="tr-to" placeholder="예: 제주" {...form.register("arrivalTo")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tr-dep">출발 시각</Label>
              <Input id="tr-dep" type="datetime-local" {...form.register("departureAt")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tr-arr">도착 시각</Label>
              <Input id="tr-arr" type="datetime-local" {...form.register("arrivalAt")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tr-ref">편명/예약번호</Label>
              <Input id="tr-ref" {...form.register("bookingRef")} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tr-cost">비용</Label>
              <Input
                id="tr-cost"
                type="number"
                min={0}
                {...form.register("cost", {
                  setValueAs: (v) => (v === "" ? undefined : Number(v)),
                })}
              />
            </div>
          </div>
          <Button type="submit" className="h-10" disabled={createTransport.isPending}>
            추가
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
