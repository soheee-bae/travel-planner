import { describe, expect, it } from "vitest";
import { randomUUID } from "@/lib/id";

describe("randomUUID", () => {
  it("returns a non-empty string", () => {
    expect(randomUUID()).toBeTypeOf("string");
    expect(randomUUID().length).toBeGreaterThan(0);
  });

  it("returns unique values across calls", () => {
    const ids = new Set(Array.from({ length: 50 }, () => randomUUID()));
    expect(ids.size).toBe(50);
  });
});
