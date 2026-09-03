"use client";

import { useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { createWishlistItemInputSchema, type WishlistItem } from "@/mocks/fixtures/wishlist";
import { z } from "zod";

const ICONS = ["📝", "🍜", "📸", "🛒", "🎁", "🏨", "💡", "❤️"] as const;

const formSchema = createWishlistItemInputSchema.omit({ tripId: true, orderIndex: true });
type FormValues = z.infer<typeof formSchema>;

export function WishlistItemDialog({
  trigger,
  initial,
  onSubmit,
}: {
  trigger: ReactNode;
  initial?: WishlistItem;
  onSubmit: (values: FormValues) => void;
}) {
  const [open, setOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      icon: initial?.icon ?? "📝",
      title: initial?.title ?? "",
      content: initial?.content ?? "",
    },
  });

  function handleSubmit(values: FormValues) {
    onSubmit(values);
    setOpen(false);
    if (!initial) form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initial ? "메모 편집" : "새 메모 추가"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex w-24 flex-col gap-1.5">
              <Label htmlFor="wish-icon">아이콘</Label>
              <Select
                defaultValue={form.getValues("icon")}
                onValueChange={(v) => form.setValue("icon", v)}
              >
                <SelectTrigger id="wish-icon" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="wish-title">제목</Label>
              <Input
                id="wish-title"
                placeholder="예: 현지인 추천 맛집들"
                {...form.register("title")}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="wish-content">내용</Label>
            <Textarea id="wish-content" rows={5} {...form.register("content")} />
          </div>
          <Button type="submit" className="h-10">
            {initial ? "저장" : "추가"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
