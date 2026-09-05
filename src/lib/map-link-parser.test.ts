import { describe, expect, it } from "vitest";
import { isShortenedMapLink, parseMapLink } from "@/lib/map-link-parser";

describe("parseMapLink", () => {
  it("Google Maps place+@lat,lng URL을 파싱한다", () => {
    const url = "https://www.google.com/maps/place/도쿄타워/@35.6585805,139.7454329,17z";
    expect(parseMapLink(url)).toEqual({
      lat: 35.6585805,
      lng: 139.7454329,
      name: "도쿄타워",
    });
  });

  it("Google Maps ?q=lat,lng URL을 파싱한다", () => {
    const url = "https://maps.google.com/?q=35.6585805,139.7454329";
    expect(parseMapLink(url)).toEqual({ lat: 35.6585805, lng: 139.7454329 });
  });

  it("네이버 지도 lat/lng 쿼리 파라미터를 파싱한다", () => {
    const url = "https://map.naver.com/p/entry/place/123?lat=35.1595&lng=136.9066";
    expect(parseMapLink(url)).toEqual({ lat: 35.1595, lng: 136.9066 });
  });

  it("네이버 지도 c= 파라미터(경도,위도 순)를 파싱한다", () => {
    const url = "https://map.naver.com/p?c=136.9066,35.1595,15,0,0,0,dh";
    expect(parseMapLink(url)).toEqual({ lat: 35.1595, lng: 136.9066 });
  });

  it("패턴에 맞지 않으면 null을 반환한다", () => {
    expect(parseMapLink("https://example.com/no-coords")).toBeNull();
  });

  it("잘못된 URL이면 null을 반환한다", () => {
    expect(parseMapLink("not a url")).toBeNull();
  });
});

describe("isShortenedMapLink", () => {
  it("단축 URL 호스트를 식별한다", () => {
    expect(isShortenedMapLink("https://maps.app.goo.gl/abc123")).toBe(true);
    expect(isShortenedMapLink("https://naver.me/xyz")).toBe(true);
  });

  it("일반 URL은 false", () => {
    expect(isShortenedMapLink("https://www.google.com/maps/place/x/@1.0,2.0")).toBe(false);
  });
});
