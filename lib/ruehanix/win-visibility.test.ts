import { describe, it, expect } from "vitest";
import { isHidden } from "./win-visibility";

describe("isHidden", () => {
  it("display: 'none' 이면 true", () => {
    expect(isHidden({ display: "none" })).toBe(true);
  });
  it("display: 'block' 이면 false", () => {
    expect(isHidden({ display: "block" })).toBe(false);
  });
  it("display 없으면 false", () => {
    expect(isHidden({})).toBe(false);
    expect(isHidden(undefined)).toBe(false);
  });
  it("display 가 'flex' / 'grid' 등 다른 값이면 false", () => {
    expect(isHidden({ display: "flex" })).toBe(false);
    expect(isHidden({ display: "grid" })).toBe(false);
  });
});