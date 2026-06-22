import { describe, expect, it } from "vitest";
import { shouldPlayBoot } from "./boot";

describe("shouldPlayBoot", () => {
  it("첫 방문(미부팅·모션허용)이면 재생", () => {
    expect(shouldPlayBoot(false, false)).toBe(true);
  });
  it("이번 세션에 이미 부팅했으면 건너뜀", () => {
    expect(shouldPlayBoot(true, false)).toBe(false);
  });
  it("모션 최소화 선호면 건너뜀", () => {
    expect(shouldPlayBoot(false, true)).toBe(false);
  });
});
