import { describe, it, expect } from "vitest";
import { formatCost, formatTokenFlow } from "./format-run";

describe("formatCost", () => {
  it.each([
    [0.012345, "$0.0123"],
    [0.012, "$0.012"],
    [0.0013, "$0.0013"],
    [0.00123456, "$0.00123"],
    [0.001, "$0.001"],
    [0.06, "$0.060"],
    [0.5, "$0.500"],
    [0.123456, "$0.123"],
    [0.0000012, "$0.0000012"],
    [0.0099996, "$0.010"],
    [0.9996, "$1.00"],
    [1.23456, "$1.23"],
    [12.345678, "$12.35"],
    [0, "$0.000"],
  ])("formats %s as %s", (usd, expected) => {
    expect(formatCost(usd)).toBe(expected);
  });

  it.each([null, undefined, Number.NaN, -1])("shows a dash for %s", (usd) => {
    expect(formatCost(usd)).toBe("—");
  });
});

describe("formatTokenFlow", () => {
  it("compacts thousands and keeps small counts as is", () => {
    expect(formatTokenFlow(8200, 1300)).toBe("8.2K→1.3K");
    expect(formatTokenFlow(15000, 999)).toBe("15.0K→999");
  });

  it("is null without usage", () => {
    expect(formatTokenFlow(null, 10)).toBeNull();
    expect(formatTokenFlow(10, undefined)).toBeNull();
    expect(formatTokenFlow(0, 0)).toBeNull();
  });
});
