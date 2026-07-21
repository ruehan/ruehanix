import { describe, expect, it } from "vitest";
import { normalizePhotos } from "./normalize";
import type { PhotoAsset } from "@/lib/sanity/photo-url";

const asset: PhotoAsset = { _id: "image-abc-2000x3000-jpg" };

describe("normalizePhotos", () => {
  it("완전한 문서를 Photo로 매핑", () => {
    expect(normalizePhotos([{ asset, title: "스파", tag: "track", order: 1 }])).toEqual([
      { asset, title: "스파", tag: "track" },
    ]);
  });
  it("asset 없는 항목은 제외(렌더 불가)", () => {
    expect(
      normalizePhotos([{ title: "no image" }, { asset, title: "ok" }]),
    ).toEqual([{ asset, title: "ok", tag: "" }]);
  });
  it("title/tag 누락 시 안전 기본값", () => {
    expect(normalizePhotos([{ asset }])).toEqual([{ asset, title: "", tag: "" }]);
  });
  it("빈/비배열 입력은 빈 배열", () => {
    expect(normalizePhotos([])).toEqual([]);
    expect(normalizePhotos(undefined)).toEqual([]);
  });
  it("folder 공백 trim → undefined (groupByFolder UNCATEGORIZED 분기)", () => {
    const out = normalizePhotos([{ asset, folder: "   " }]);
    expect(out[0].folder).toBeUndefined();
  });
  it("folder undefined → undefined", () => {
    const out = normalizePhotos([{ asset }]);
    expect(out[0].folder).toBeUndefined();
  });
  it("description 공백 trim → undefined", () => {
    const out = normalizePhotos([{ asset, description: "  \n  " }]);
    expect(out[0].description).toBeUndefined();
  });
  it("description 유효 값은 trim 후 보존", () => {
    const out = normalizePhotos([{ asset, description: "  hello world  " }]);
    expect(out[0].description).toBe("hello world");
  });
});
