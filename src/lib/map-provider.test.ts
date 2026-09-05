import { describe, expect, it } from "vitest";
import { getMapProvider } from "@/lib/map-provider";

describe("getMapProvider", () => {
  it("한국은 naver", () => {
    expect(getMapProvider("KR")).toBe("naver");
    expect(getMapProvider("kr")).toBe("naver");
  });

  it("그 외 국가는 google", () => {
    expect(getMapProvider("JP")).toBe("google");
    expect(getMapProvider("US")).toBe("google");
  });
});
