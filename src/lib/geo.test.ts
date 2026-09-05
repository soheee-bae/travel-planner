import { describe, expect, it } from "vitest";
import { estimateWalkMinutes, haversineDistanceMeters, projectForClustering } from "@/lib/geo";

describe("haversineDistanceMeters", () => {
  it("같은 지점이면 0이다", () => {
    expect(haversineDistanceMeters({ lat: 35.17, lng: 137.0 }, { lat: 35.17, lng: 137.0 })).toBe(0);
  });

  it("서울역 ~ 강남역 거리를 대략적으로 맞춘다 (약 10km)", () => {
    const seoulStation = { lat: 37.5547, lng: 126.9707 };
    const gangnamStation = { lat: 37.4979, lng: 127.0276 };
    const distance = haversineDistanceMeters(seoulStation, gangnamStation);
    expect(distance).toBeGreaterThan(7000);
    expect(distance).toBeLessThan(9000);
  });
});

describe("estimateWalkMinutes", () => {
  it("가까운 두 지점은 몇 분 이내로 추정된다", () => {
    const a = { lat: 35.17, lng: 137.0 };
    const b = { lat: 35.171, lng: 137.001 };
    const minutes = estimateWalkMinutes(a, b);
    expect(minutes).toBeGreaterThan(0);
    expect(minutes).toBeLessThan(30);
  });

  it("최소 1분은 반환한다", () => {
    const point = { lat: 35.17, lng: 137.0 };
    expect(estimateWalkMinutes(point, point)).toBe(1);
  });
});

describe("projectForClustering", () => {
  it("위도가 높을수록 경도 보정 비율이 작아진다", () => {
    const point = { lat: 35, lng: 137 };
    const atEquator = projectForClustering(point, 0);
    const atMidLat = projectForClustering(point, 35);
    expect(atMidLat.x).toBeLessThan(atEquator.x);
  });
});
