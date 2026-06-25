import { describe, expect, it } from "vitest";
import { ACCENT_PALETTE, THEME_MODES } from "./data";

describe("ACCENT_PALETTE", () => {
  it("각 항목은 비어있지 않은 hex와 name을 가진다", () => {
    for (const c of ACCENT_PALETTE) {
      expect(c.hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(c.name.length).toBeGreaterThan(0);
    }
  });
  it("hex는 중복 없다 (=== 매핑이 정확히 한 항목만 선택 보장)", () => {
    const hexes = ACCENT_PALETTE.map((c) => c.hex);
    expect(new Set(hexes).size).toBe(hexes.length);
  });
  it("name은 중복 없다 (a11y 라벨 구분 가능)", () => {
    const names = ACCENT_PALETTE.map((c) => c.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("THEME_MODES", () => {
  it("key는 고유 (=== 매핑이 정확히 한 항목만 선택 보장)", () => {
    const keys = THEME_MODES.map((m) => m.k);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it("각 항목은 label·prev를 가진다", () => {
    for (const m of THEME_MODES) {
      expect(m.label.length).toBeGreaterThan(0);
      expect(m.prev.length).toBeGreaterThan(0);
    }
  });
});
