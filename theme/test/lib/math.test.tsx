import { describe, expect, it } from "vitest";

import { clamp } from "../../src/lib/math";
import { cssTimeToMs } from "../../src/components/tabs/css-time";

describe("clamp", () => {
  it("keeps a value inside the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(42, 0, 10)).toBe(10);
  });
});

describe("cssTimeToMs", () => {
  it("reads milliseconds and seconds, with or without a leading zero and around whitespace", () => {
    expect(cssTimeToMs("100ms")).toBe(100);
    expect(cssTimeToMs(".1s")).toBe(100);
    expect(cssTimeToMs(" 0.25s ")).toBe(250);
    expect(cssTimeToMs("2S")).toBe(2000);
  });

  it("returns NaN for anything that is not a CSS time, so callers can fall back", () => {
    expect(cssTimeToMs("")).toBeNaN();
    expect(cssTimeToMs("fast")).toBeNaN();
    expect(cssTimeToMs("100")).toBeNaN();
    expect(cssTimeToMs("var(--x)")).toBeNaN();
    expect(cssTimeToMs("") || 100).toBe(100);
  });
});
