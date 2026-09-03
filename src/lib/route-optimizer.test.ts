import { describe, expect, it } from "vitest";
import { optimizeRouteOrder, type RoutePoint } from "@/lib/route-optimizer";

function pathLength(points: RoutePoint[]): number {
  let sum = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    sum += Math.hypot(a.lat - b.lat, a.lng - b.lng);
  }
  return sum;
}

describe("optimizeRouteOrder", () => {
  it("2개 이하는 그대로 반환한다", () => {
    const points: RoutePoint[] = [{ id: "a", lat: 0, lng: 0 }];
    expect(optimizeRouteOrder(points)).toEqual(points);
  });

  it("일직선 위 4개 점을 순서대로(지그재그 없이) 정렬한다", () => {
    // 의도적으로 순서를 섞어서 입력한다.
    const points: RoutePoint[] = [
      { id: "start", lat: 0, lng: 0 },
      { id: "far", lat: 0, lng: 3 },
      { id: "near", lat: 0, lng: 1 },
      { id: "mid", lat: 0, lng: 2 },
    ];
    const result = optimizeRouteOrder(points);
    expect(result[0].id).toBe("start");
    expect(result.map((p) => p.id)).toEqual(["start", "near", "mid", "far"]);
  });

  it("무작위로 섞인 좌표에서도 순서를 개선한다 (지그재그보다 짧아짐)", () => {
    const points: RoutePoint[] = [
      { id: "start", lat: 0, lng: 0 },
      { id: "b", lat: 0, lng: 10 },
      { id: "c", lat: 0, lng: 1 },
      { id: "d", lat: 0, lng: 9 },
      { id: "e", lat: 0, lng: 2 },
      { id: "f", lat: 0, lng: 8 },
    ];
    const naive = pathLength(points);
    const optimized = pathLength(optimizeRouteOrder(points));
    expect(optimized).toBeLessThan(naive);
  });

  it("13개 이상(Held-Karp 한계 초과)에서도 시작점을 유지하며 동작한다", () => {
    const points: RoutePoint[] = Array.from({ length: 15 }, (_, i) => ({
      id: `p${i}`,
      lat: Math.sin(i) * 0.1,
      lng: Math.cos(i) * 0.1,
    }));
    const result = optimizeRouteOrder(points);
    expect(result).toHaveLength(15);
    expect(result[0].id).toBe("p0");
    expect(new Set(result.map((p) => p.id)).size).toBe(15);
  });
});
