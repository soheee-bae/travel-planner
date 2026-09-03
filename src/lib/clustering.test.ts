import { describe, expect, it } from "vitest";
import { kMeansCluster } from "@/lib/clustering";

describe("kMeansCluster", () => {
  it("공간적으로 뚜렷한 두 그룹을 서로 다른 클러스터로 나눈다", () => {
    const items = [
      { id: "a1", lat: 35.17, lng: 137.0 },
      { id: "a2", lat: 35.171, lng: 137.001 },
      { id: "a3", lat: 35.169, lng: 136.999 },
      { id: "b1", lat: 35.3, lng: 137.3 },
      { id: "b2", lat: 35.301, lng: 137.301 },
      { id: "b3", lat: 35.299, lng: 137.299 },
    ];
    const assignment = kMeansCluster(items, 2);

    const groupA = new Set([assignment.get("a1"), assignment.get("a2"), assignment.get("a3")]);
    const groupB = new Set([assignment.get("b1"), assignment.get("b2"), assignment.get("b3")]);
    expect(groupA.size).toBe(1);
    expect(groupB.size).toBe(1);
    expect(groupA).not.toEqual(groupB);
  });

  it("빈 배열이면 빈 결과를 반환한다", () => {
    expect(kMeansCluster([], 3).size).toBe(0);
  });

  it("k가 아이템 수보다 크면 아이템 수만큼만 클러스터를 만든다", () => {
    const items = [
      { id: "a", lat: 35.1, lng: 137.1 },
      { id: "b", lat: 35.2, lng: 137.2 },
    ];
    const assignment = kMeansCluster(items, 5);
    const clusters = new Set(assignment.values());
    expect(clusters.size).toBeLessThanOrEqual(2);
  });
});
