"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { useCreateTrip } from "@/features/trips/hooks";
import { createTripInputSchema, type CreateTripInput } from "@/mocks/fixtures/trips";
import { endDateFromNights } from "@/lib/trip-days";
import { calcNights } from "@/lib/date";
import { cn } from "@/lib/utils";

const COUNTRIES = [
  { code: "KR", label: "🇰🇷 한국" },
  { code: "JP", label: "🇯🇵 일본" },
  { code: "TH", label: "🇹🇭 태국" },
  { code: "VN", label: "🇻🇳 베트남" },
  { code: "US", label: "🇺🇸 미국" },
  { code: "FR", label: "🇫🇷 프랑스" },
] as const;

const COMPANION_PRESETS = ["혼자", "커플", "친구들과", "가족과"] as const;

const COVER_EMOJIS = ["✈️", "🏯", "🌴", "🏖️", "🗻", "🎡", "🍜", "🏙️"] as const;

const CURRENCIES = ["KRW", "JPY", "USD", "EUR"] as const;

export function CreateTripForm() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const [customCompanion, setCustomCompanion] = useState(false);

  const form = useForm<CreateTripInput>({
    resolver: zodResolver(createTripInputSchema),
    defaultValues: {
      title: "",
      destinationCountry: "KR",
      destinationCity: "",
      startDate: "",
      endDate: "",
      companions: "혼자",
      coverEmoji: "✈️",
      baseCurrency: "KRW",
    },
  });

  // form.watch()는 React Compiler가 안전하게 메모할 수 없다. useWatch 훅으로
  // 대체하면 같은 값을 얻으면서 컴파일러 경고를 피할 수 있다.
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const endDate = useWatch({ control: form.control, name: "endDate" });
  const companions = useWatch({ control: form.control, name: "companions" });
  const nights = startDate && endDate ? calcNights(startDate, endDate) : 0;

  function handleNightsChange(value: number) {
    if (!startDate) return;
    form.setValue("endDate", endDateFromNights(startDate, value), { shouldValidate: true });
  }

  function onSubmit(values: CreateTripInput) {
    createTrip.mutate(values, {
      onSuccess: (trip) => router.push(`/trips/${trip.id}`),
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">여행 이름</Label>
        <Input id="title" placeholder="예: 제주도 여행" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">여행 이름을 입력해 주세요.</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="destinationCountry">국가</Label>
          <Select
            defaultValue={form.getValues("destinationCountry")}
            onValueChange={(v) => form.setValue("destinationCountry", v)}
          >
            <SelectTrigger id="destinationCountry" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="destinationCity">여행지</Label>
          <Input
            id="destinationCity"
            placeholder="예: 제주도"
            {...form.register("destinationCity")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="startDate">날짜</Label>
        <div className="flex items-center gap-2">
          <Input
            id="startDate"
            type="date"
            className="flex-1"
            {...form.register("startDate", {
              onChange: (e) => {
                if (nights > 0) {
                  form.setValue("endDate", endDateFromNights(e.target.value, nights));
                }
              },
            })}
          />
          <span className="text-sm text-muted-foreground">~</span>
          <Input id="endDate" type="date" className="flex-1" {...form.register("endDate")} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>몇 박?</span>
          <Input
            type="number"
            min={0}
            max={30}
            value={nights}
            onChange={(e) => handleNightsChange(Number(e.target.value))}
            className="h-8 w-20"
            aria-label="박 수"
          />
          <span>{nights > 0 ? `${nights}박 ${nights + 1}일` : "당일치기"}</span>
        </div>
        {(form.formState.errors.startDate || form.formState.errors.endDate) && (
          <p className="text-xs text-destructive">날짜를 선택해 주세요.</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label>누구랑?</Label>
        <div className="flex flex-wrap gap-2">
          {COMPANION_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setCustomCompanion(false);
                form.setValue("companions", preset);
              }}
              className={cn(
                "rounded-md border px-3 py-1.5 text-sm",
                !customCompanion && companions === preset
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border text-muted-foreground",
              )}
            >
              {preset}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCustomCompanion(true)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm",
              customCompanion
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border text-muted-foreground",
            )}
          >
            직접 입력
          </button>
        </div>
        {customCompanion && (
          <Input
            placeholder="예: 회사 동료들과"
            {...form.register("companions")}
            className="mt-1"
          />
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="coverEmoji">커버</Label>
          <Select
            defaultValue={form.getValues("coverEmoji")}
            onValueChange={(v) => form.setValue("coverEmoji", v)}
          >
            <SelectTrigger id="coverEmoji" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COVER_EMOJIS.map((emoji) => (
                <SelectItem key={emoji} value={emoji}>
                  {emoji}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="baseCurrency">기본 통화</Label>
          <Select
            defaultValue={form.getValues("baseCurrency")}
            onValueChange={(v) =>
              form.setValue("baseCurrency", v as CreateTripInput["baseCurrency"])
            }
          >
            <SelectTrigger id="baseCurrency" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((currency) => (
                <SelectItem key={currency} value={currency}>
                  {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-2 h-11" disabled={createTrip.isPending}>
        {createTrip.isPending ? "만드는 중…" : "여행 만들기"}
      </Button>
    </form>
  );
}
