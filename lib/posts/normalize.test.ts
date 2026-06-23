import { describe, expect, it } from "vitest";
import { formatDate, normalizePost, portableTextToParagraphs } from "./normalize";

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

describe("portableTextToParagraphs", () => {
  it("block의 children text를 문단으로 추출", () => {
    const blocks = [
      { _type: "block", children: [{ text: "안녕 " }, { text: "세계" }] },
      { _type: "block", children: [{ text: "둘째 문단" }] },
    ];
    expect(portableTextToParagraphs(blocks)).toEqual(["안녕 세계", "둘째 문단"]);
  });
  it("block 아닌 항목·빈 문단·배열 아님은 건너뜀", () => {
    expect(portableTextToParagraphs([{ _type: "image" }, { _type: "block", children: [{ text: "  " }] }])).toEqual([]);
    expect(portableTextToParagraphs(undefined)).toEqual([]);
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
  it("알 수 없는 카테고리는 dev로 폴백", () => {
    expect(normalizePost({ category: "unknown" }).category).toBe("dev");
  });
});
