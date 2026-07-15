// @vitest-environment happy-dom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { nextFocusIndex } from "./focus-trap";

describe("nextFocusIndex", () => {
  it("0개 focusable → 0", () => {
    expect(nextFocusIndex(0, 0, 0)).toBe(0);
  });
  it("1개 focusable → 0 고정", () => {
    expect(nextFocusIndex(0, 1, 1)).toBe(0);
    expect(nextFocusIndex(1, 1, 0)).toBe(0);
  });
  it("forward: 다음 index, 마지막에서 0", () => {
    expect(nextFocusIndex(0, 3, 1)).toBe(1);
    expect(nextFocusIndex(2, 3, 1)).toBe(0);
  });
  it("backward: -1 → 마지막, 0 → 마지막-1", () => {
    expect(nextFocusIndex(0, 3, -1)).toBe(2);
    expect(nextFocusIndex(2, 3, -1)).toBe(1);
  });
  it("out-of-range current → wrap (5 forward 3개 → 0; -1 forward 3개 → 1)", () => {
    expect(nextFocusIndex(5, 3, 1)).toBe(0);  // safe=2 → (2+1)%3=0
    expect(nextFocusIndex(-1, 3, 1)).toBe(1); // safe=0 → (0+1)%3=1
  });
});