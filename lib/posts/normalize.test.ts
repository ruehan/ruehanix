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
  it("완전한 문서를 매핑(body는 문단 배열)", () => {
    const p = normalizePost({
      slug: { current: "rsc-1년" },
      title: "RSC 1년",
      category: "dev",
      publishedAt: "2026-06-18T00:00:00Z",
      excerpt: "요약",
      readingTime: "9분",
      body: [{ _type: "block", children: [{ text: "본문 한 줄" }] }],
    });
    expect(p.slug).toBe("rsc-1년");
    expect(p.category).toBe("dev");
    // 원본 Portable Text 블록을 그대로 보존(평탄화하지 않음).
    expect(p.body).toEqual([{ _type: "block", children: [{ text: "본문 한 줄" }] }]);
    expect(p.date).toBe("2026.06.18");
  });
  it("누락 필드는 안전한 기본값", () => {
    const p = normalizePost({});
    expect(p.slug).toBe("");
    expect(p.category).toBe("dev");
    expect(p.body).toEqual([]);
    expect(p.date).toBe("");
  });
  it("body가 배열이 아니면 빈 배열", () => {
    expect(normalizePost({ body: undefined }).body).toEqual([]);
  });
  it("asset 없는 image 블록은 제외(urlFor 크래시 방지), 정상 블록은 보존", () => {
    const body = [
      { _type: "block", children: [{ text: "문단" }] },
      { _type: "image", alt: "업로드 전" }, // asset 없음 → 제외
      { _type: "image", asset: { _ref: "image-abc" } }, // 정상 → 보존
    ];
    expect(normalizePost({ body }).body).toEqual([
      { _type: "block", children: [{ text: "문단" }] },
      { _type: "image", asset: { _ref: "image-abc" } },
    ]);
  });
  it("알 수 없는 카테고리는 dev로 폴백", () => {
    expect(normalizePost({ category: "unknown" }).category).toBe("dev");
  });
});
