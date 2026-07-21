import { describe, it, expect } from "vitest";
import { catShortcut, sortShortcut } from "./files-shortcuts";

describe("catShortcut", () => {
  it("all → ⌘1", () => {
    expect(catShortcut("all")).toBe("⌘1");
  });

  it("5개 카테고리(dev/sim/moto/music/blog) → ⌘2~⌘6", () => {
    expect(catShortcut("dev")).toBe("⌘2");
    expect(catShortcut("sim")).toBe("⌘3");
    expect(catShortcut("moto")).toBe("⌘4");
    expect(catShortcut("music")).toBe("⌘5");
    expect(catShortcut("blog")).toBe("⌘6");
  });

  it("정의되지 않은 키 → 빈 문자열", () => {
    expect(catShortcut("nonexistent" as never)).toBe("");
  });
});

describe("sortShortcut", () => {
  it("4종 정렬 키 → ⌘⇧L/O/A/Z", () => {
    expect(sortShortcut("date-desc")).toBe("⌘⇧L");
    expect(sortShortcut("date-asc")).toBe("⌘⇧O");
    expect(sortShortcut("title-asc")).toBe("⌘⇧A");
    expect(sortShortcut("title-desc")).toBe("⌘⇧Z");
  });
});