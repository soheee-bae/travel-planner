"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Plus } from "lucide-react";
import { z } from "zod";
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
import { useCreatePlace } from "@/features/places/hooks";
import {
  createPlaceInputSchema,
  PLACE_CATEGORIES,
  PLACE_PRIORITIES,
  type CreatePlaceInput,
} from "@/mocks/fixtures/places";

const formSchema = createPlaceInputSchema
  .omit({ tripId: true, dayIndex: true, orderIndex: true, tags: true })
  .extend({ tagsInput: z.string().optional() });
type FormValues = z.infer<typeof formSchema>;

/** 지도 링크나 주소 한 번에 붙여넣으면 좌표를 자동으로 채운다 — 이 앱의
 * 실제 병목은 장소 수십 개를 손으로 입력하는 것이기 때문이다
 * (docs/06-features-and-algorithms.md §6.9 1순위). */
function useAutofillCoordinates(form: ReturnType<typeof useForm<FormValues>>) {
  const [linkInput, setLinkInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [lat, setLat] = useState<number>();
  const [lng, setLng] = useState<number>();

  async function fetchFromLink() {
    if (!linkInput.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/geocode/parse?url=${encodeURIComponent(linkInput)}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { lat: number; lng: number; name?: string };
      setLat(data.lat);
      setLng(data.lng);
      if (data.name && !form.getValues("name")) form.setValue("name", data.name);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  async function fetchFromAddress() {
    const address = form.getValues("address");
    if (!address?.trim()) return;
    setStatus("loading");
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(address)}`);
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { lat: number; lng: number };
      setLat(data.lat);
      setLng(data.lng);
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return { linkInput, setLinkInput, status, lat, lng, fetchFromLink, fetchFromAddress };
}

export function AddPlaceDialog({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const createPlace = useCreatePlace(tripId);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", category: "관광", priority: "가능하면" },
  });
  const autofill = useAutofillCoordinates(form);

  function onSubmit(values: FormValues) {
    const { tagsInput, ...rest } = values;
    const input: CreatePlaceInput = {
      tripId,
      dayIndex: null,
      orderIndex: 0,
      tags: tagsInput
        ? tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      lat: autofill.lat,
      lng: autofill.lng,
      ...rest,
    };
    createPlace.mutate(input, { onSuccess: () => setOpen(false) });
    form.reset();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1">
          <Plus className="size-4" aria-hidden="true" />
          장소 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>장소 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="place-name">장소명</Label>
            <Input id="place-name" placeholder="예: 성산일출봉" {...form.register("name")} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="place-category">카테고리</Label>
            <Select
              defaultValue={form.getValues("category")}
              onValueChange={(v) => form.setValue("category", v as FormValues["category"])}
            >
              <SelectTrigger id="place-category" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLACE_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 rounded-md border border-dashed border-border p-3">
            <Label htmlFor="place-link">지도 링크 붙여넣기</Label>
            <div className="flex gap-2">
              <Input
                id="place-link"
                placeholder="구글/네이버 지도 공유 링크"
                value={autofill.linkInput}
                onChange={(e) => autofill.setLinkInput(e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={autofill.fetchFromLink}
                disabled={autofill.status === "loading"}
              >
                가져오기
              </Button>
            </div>
            {autofill.lat != null && autofill.lng != null && (
              <p className="text-xs text-money">
                좌표 확인됨: {autofill.lat.toFixed(5)}, {autofill.lng.toFixed(5)}
              </p>
            )}
            {autofill.status === "error" && (
              <p className="text-xs text-destructive">
                좌표를 찾지 못했습니다. 주소로 다시 시도해 보세요.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="place-address">주소</Label>
            <div className="flex gap-2">
              <Input id="place-address" {...form.register("address")} />
              <Button
                type="button"
                variant="outline"
                onClick={autofill.fetchFromAddress}
                disabled={autofill.status === "loading"}
              >
                찾기
              </Button>
            </div>
          </div>

          <details className="rounded-md border border-border p-3">
            <summary className="cursor-pointer text-sm font-medium text-foreground">
              자세히 입력
            </summary>
            <div className="mt-3 flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="place-hours">영업시간</Label>
                  <Input
                    id="place-hours"
                    placeholder="09:00~18:00"
                    {...form.register("businessHours")}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="place-closed">휴무일</Label>
                  <Input
                    id="place-closed"
                    placeholder="매주 월요일"
                    {...form.register("closedDays")}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="place-cost">예상 비용</Label>
                  <Input
                    id="place-cost"
                    type="number"
                    min={0}
                    {...form.register("estimatedCost", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="place-duration">소요시간(분)</Label>
                  <Input
                    id="place-duration"
                    type="number"
                    min={0}
                    {...form.register("durationMin", {
                      setValueAs: (v) => (v === "" ? undefined : Number(v)),
                    })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="place-priority">우선순위</Label>
                <Select
                  defaultValue={form.getValues("priority")}
                  onValueChange={(v) => form.setValue("priority", v as FormValues["priority"])}
                >
                  <SelectTrigger id="place-priority" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PLACE_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="place-tags">태그 (쉼표로 구분)</Label>
                <Input
                  id="place-tags"
                  placeholder="#바다뷰, #디저트"
                  {...form.register("tagsInput")}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="place-memo">메모</Label>
                <Textarea id="place-memo" {...form.register("memo")} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="place-link-url">링크</Label>
                <Input
                  id="place-link-url"
                  placeholder="인스타/블로그 등"
                  {...form.register("linkUrl")}
                />
              </div>
            </div>
          </details>

          <Button type="submit" className="h-10" disabled={createPlace.isPending}>
            추가
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
