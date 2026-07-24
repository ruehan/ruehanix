import { describe, expect, it } from "vitest";
import { ABOUT_META, KEYBINDINGS, SETTINGS_TABS } from "./settings";
import type { UiState } from "./types";

describe("SETTINGS_TABS", () => {
  it("각 탭은 고유 key와 ready 플래그를 가진다", () => {
    const keys = SETTINGS_TABS.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const t of SETTINGS_TABS) {
      expect(typeof t.key).toBe("string");
      expect(typeof t.label).toBe("string");
      expect(typeof t.ready).toBe("boolean");
    }
  });

  it("appearance·keybindings·wallpaper·about 탭은 구현(ready) 상태", () => {
    const byKey = Object.fromEntries(SETTINGS_TABS.map((t) => [t.key, t.ready]));
    expect(byKey.appearance).toBe(true);
    expect(byKey.keybindings).toBe(true);
    expect(byKey.wallpaper).toBe(true);
    expect(byKey.about).toBe(true);
  });

  it("미구현 탭은 ready:false — 비활성 표시용", () => {
    const notReady = SETTINGS_TABS.filter((t) => !t.ready).map((t) => t.key);
    // General·Window Rules·Displays는 의도적으로 비활성 (배경화면은 ADR 0062 로 활성화됨)
    expect(notReady).toEqual(expect.arrayContaining(["general", "windowrules", "displays"]));
    expect(notReady).not.toContain("wallpaper");
  });
});

describe("KEYBINDINGS", () => {
  it("각 항목은 [combo, 설명] 쌍이며 combo는 고유", () => {
    const combos = KEYBINDINGS.map(([c]) => c);
    expect(new Set(combos).size).toBe(combos.length);
    for (const [combo, desc] of KEYBINDINGS) {
      expect(combo.length).toBeGreaterThan(0);
      expect(desc.length).toBeGreaterThan(0);
    }
  });

  it("shell 오버레이와 동일 항목을 포함 (단일 진실 소스)", () => {
    const combos = KEYBINDINGS.map(([c]) => c);
    expect(combos).toContain("Super + 1-6");
    expect(combos).toContain("Super + /");
    expect(combos).toContain("Esc");
  });
});

describe("ABOUT_META", () => {
  it("이름·버전·커널·스택 필드가 비어있지 않다", () => {
    expect(ABOUT_META.name.length).toBeGreaterThan(0);
    expect(ABOUT_META.version.length).toBeGreaterThan(0);
    expect(ABOUT_META.kernel.length).toBeGreaterThan(0);
    expect(ABOUT_META.stack.length).toBeGreaterThan(0);
  });
});
