import { describe, expect, it } from "vitest";
import { isActivateKey } from "./a11y";

describe("isActivateKey", () => {
  it("Enter·Space는 활성화 키", () => {
    expect(isActivateKey("Enter")).toBe(true);
    expect(isActivateKey(" ")).toBe(true);
    expect(isActivateKey("Spacebar")).toBe(true);
  });
  it("다른 키는 아님", () => {
    expect(isActivateKey("a")).toBe(false);
    expect(isActivateKey("Escape")).toBe(false);
    expect(isActivateKey("Tab")).toBe(false);
  });
});
