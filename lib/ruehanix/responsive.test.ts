import { describe, expect, it } from "vitest";
import { MOBILE_BREAKPOINT, MOBILE_DOCK, MOBILE_TOPBAR, isMobileWidth, mobileAppRect } from "./responsive";

describe("isMobileWidth", () => {
  it("경계 768은 데스크톱(false), 767은 모바일(true)", () => {
    expect(isMobileWidth(MOBILE_BREAKPOINT)).toBe(false);
    expect(isMobileWidth(MOBILE_BREAKPOINT - 1)).toBe(true);
  });
  it("전형적 폭 분류", () => {
    expect(isMobileWidth(375)).toBe(true); // 폰
    expect(isMobileWidth(820)).toBe(false); // 태블릿
    expect(isMobileWidth(1440)).toBe(false); // 데스크톱
  });
});

describe("mobileAppRect", () => {
  it("상단바 아래 ~ 독 위 풀스크린", () => {
    const r = mobileAppRect({ W: 375, H: 812 });
    expect(r).toEqual({ x: 0, y: MOBILE_TOPBAR, w: 375, h: 812 - MOBILE_TOPBAR - MOBILE_DOCK });
  });
  it("폭은 뷰포트 전체", () => {
    expect(mobileAppRect({ W: 400, H: 700 }).w).toBe(400);
  });
  it("상단바+독보다 낮은 뷰포트에서도 높이는 음수가 아니다", () => {
    expect(mobileAppRect({ W: 320, H: 80 }).h).toBe(0);
  });
});
