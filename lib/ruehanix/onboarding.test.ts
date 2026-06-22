import { describe, expect, it } from "vitest";
import { shouldShowHint } from "./onboarding";

describe("shouldShowHint", () => {
  it("데스크톱·부팅완료·미열람이면 표시", () => {
    expect(shouldShowHint({ seen: false, booting: false, isMobile: false })).toBe(true);
  });
  it("이미 봤으면 숨김", () => {
    expect(shouldShowHint({ seen: true, booting: false, isMobile: false })).toBe(false);
  });
  it("부팅 중이면 숨김", () => {
    expect(shouldShowHint({ seen: false, booting: true, isMobile: false })).toBe(false);
  });
  it("모바일이면 숨김(독이 이미 명확)", () => {
    expect(shouldShowHint({ seen: false, booting: false, isMobile: true })).toBe(false);
  });
});
