import { describe, expect, it } from "vitest";
import { accentEff, catColors, effMode, hexA, wallpaper } from "./theme";

describe("effMode", () => {
  it("dark/light 모드는 prefersLight와 무관하게 그대로 반환", () => {
    expect(effMode("dark", true)).toBe("dark");
    expect(effMode("light", false)).toBe("light");
  });
  it("auto는 OS 선호도를 따른다", () => {
    expect(effMode("auto", true)).toBe("light");
    expect(effMode("auto", false)).toBe("dark");
  });
});

describe("accentEff", () => {
  it("다크에서는 accent 원본 유지", () => {
    expect(accentEff("dark", "#cba6f7", false)).toBe("#cba6f7");
  });
  it("라이트에서는 Latte 톤으로 매핑", () => {
    expect(accentEff("light", "#cba6f7", false)).toBe("#8839ef");
    expect(accentEff("light", "#89b4fa", false)).toBe("#1e66f5");
  });
  it("auto + OS 라이트면 Latte 매핑", () => {
    expect(accentEff("auto", "#f38ba8", true)).toBe("#d20f39");
  });
  it("매핑에 없는 색은 원본 유지", () => {
    expect(accentEff("light", "#000000", false)).toBe("#000000");
  });
});

describe("hexA", () => {
  it("#rrggbb + 알파를 rgba로 변환", () => {
    expect(hexA("#cba6f7", 0.5)).toBe("rgba(203,166,247,0.5)");
    expect(hexA("#000000", 1)).toBe("rgba(0,0,0,1)");
    expect(hexA("#ffffff", 0)).toBe("rgba(255,255,255,0)");
  });
});

describe("catColors", () => {
  it("라이트/다크 팔레트가 다르다", () => {
    expect(catColors(false).dev).toBe("#89b4fa");
    expect(catColors(true).dev).toBe("#1e66f5");
  });
});

describe("wallpaper", () => {
  it("accent를 그라디언트에 반영", () => {
    const dark = wallpaper(false, "#cba6f7");
    expect(dark).toContain("rgba(203,166,247,0.2)");
    expect(dark).toContain("#11111b");
    const light = wallpaper(true, "#cba6f7");
    expect(light).toContain("#dce0e8");
  });
});
