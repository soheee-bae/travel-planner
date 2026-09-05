import { describe, expect, it } from "vitest";
import { endDateFromNights, getTripDays } from "@/lib/trip-days";

describe("getTripDays", () => {
  it("2박 3일 여행은 Day 1~3을 반환한다", () => {
    const days = getTripDays("2026-09-15", "2026-09-17");
    expect(days).toEqual([
      { dayIndex: 1, date: "2026-09-15" },
      { dayIndex: 2, date: "2026-09-16" },
      { dayIndex: 3, date: "2026-09-17" },
    ]);
  });

  it("당일치기는 Day 1 하나만 반환한다", () => {
    expect(getTripDays("2026-09-15", "2026-09-15")).toEqual([{ dayIndex: 1, date: "2026-09-15" }]);
  });
});

describe("endDateFromNights", () => {
  it("시작일 + 박수로 종료일을 계산한다", () => {
    expect(endDateFromNights("2026-09-15", 2)).toBe("2026-09-17");
    expect(endDateFromNights("2026-09-15", 0)).toBe("2026-09-15");
  });
});
