import { describe, expect, it } from "vitest";
import { formatDate, normalizePost } from "./normalize";

describe("formatDate", () => {
  it("ISO → YYYY.MM.DD (UTC 고정)", () => {
    expect(formatDate("2026-06-18T09:00:00Z")).toBe("2026.06.18");
  });
  it("UTC 경계: 늦은 UTC 시각도 그 날짜 그대로(로컬 TZ에 흔들리지 않음)", () => {
    expect(formatDate("2026-06-18T23:30:00Z")).toBe("2026.06.18");
  });
  it("빈/유효하지 않은 값은 빈 문자열", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});

describe("normalizePost", () => {
  it("완전한 문서를 매핑", () => {
    const p = normalizePost({
      slug: { current: "rsc-1년" },
      title: "RSC 1년",
      category: "dev",
      publishedAt: "2026-06-18T00:00:00Z",
      excerpt: "요약",
      readingTime: "9분",
      body: [{ _type: "block" }],
    });
    expect(p.slug).toBe("rsc-1년");
    expect(p.title).toBe("RSC 1년");
    expect(p.category).toBe("dev");
    expect(p.readingTime).toBe("9분");
    expect(p.body).toHaveLength(1);
    expect(p.date).toMatch(/^2026\.06\.\d{2}$/);
  });
  it("누락 필드는 안전한 기본값", () => {
    const p = normalizePost({});
    expect(p.slug).toBe("");
    expect(p.title).toBe("");
    expect(p.category).toBe("dev"); // 기본
    expect(p.body).toEqual([]);
    expect(p.date).toBe("");
  });
  it("알 수 없는 카테고리는 dev로 폴백", () => {
    expect(normalizePost({ category: "unknown" }).category).toBe("dev");
  });
});
