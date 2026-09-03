import { describe, expect, it } from "vitest";
import { calcNights, formatDateRange, formatDuration } from "@/lib/date";

describe("calcNights", () => {
  it("2박 3일을 2로 계산한다", () => {
    expect(calcNights("2026-09-15", "2026-09-17")).toBe(2);
  });

  it("당일치기는 0으로 계산한다", () => {
    expect(calcNights("2026-09-15", "2026-09-15")).toBe(0);
  });
});

describe("formatDuration", () => {
  it("2박 3일로 표기한다", () => {
    expect(formatDuration("2026-09-15", "2026-09-17")).toBe("2박 3일");
  });

  it("당일치기는 1일로 표기한다", () => {
    expect(formatDuration("2026-09-15", "2026-09-15")).toBe("1일");
  });
});

describe("formatDateRange", () => {
  it("9/15~9/17 형태로 표기한다", () => {
    expect(formatDateRange("2026-09-15", "2026-09-17")).toBe("9/15~9/17");
  });
});
