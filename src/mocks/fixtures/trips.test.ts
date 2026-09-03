import { describe, expect, it } from "vitest";
import { initialTrips, tripSchema } from "@/mocks/fixtures/trips";

describe("trips fixture", () => {
  it("모든 시드 데이터가 스키마를 통과한다", () => {
    for (const trip of initialTrips) {
      expect(() => tripSchema.parse(trip)).not.toThrow();
    }
  });

  it("id가 서로 중복되지 않는다", () => {
    const ids = new Set(initialTrips.map((t) => t.id));
    expect(ids.size).toBe(initialTrips.length);
  });
});
