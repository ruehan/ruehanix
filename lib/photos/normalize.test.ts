import { describe, expect, it } from "vitest";
import { normalizePhotos } from "./normalize";

describe("normalizePhotos", () => {
  it("완전한 문서를 Photo로 매핑", () => {
    expect(normalizePhotos([{ url: "https://cdn/x.jpg", title: "스파", tag: "track", order: 1 }])).toEqual([
      { url: "https://cdn/x.jpg", title: "스파", tag: "track" },
    ]);
  });
  it("url 없는 항목은 제외(렌더 불가)", () => {
    expect(normalizePhotos([{ title: "no image" }, { url: "https://cdn/y.jpg", title: "ok" }])).toEqual([
      { url: "https://cdn/y.jpg", title: "ok", tag: "" },
    ]);
  });
  it("title/tag 누락 시 안전 기본값", () => {
    expect(normalizePhotos([{ url: "https://cdn/z.jpg" }])).toEqual([{ url: "https://cdn/z.jpg", title: "", tag: "" }]);
  });
  it("빈/비배열 입력은 빈 배열", () => {
    expect(normalizePhotos([])).toEqual([]);
    expect(normalizePhotos(undefined)).toEqual([]);
  });
});
