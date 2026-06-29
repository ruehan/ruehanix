import { describe, expect, it } from "vitest";
import { MAX_BOOKMARKS, parseBookmarks, serializeBookmarks, toggleBookmark } from "./bookmark-storage";

describe("parseBookmarks", () => {
  it("직렬화 → 파싱 라운드트립", () => {
    const list = ["a", "b", "c"];
    expect(parseBookmarks(serializeBookmarks(list))).toEqual(list);
  });
  it("빈 값/잘못된 JSON은 null", () => {
    expect(parseBookmarks(null)).toBeNull();
    expect(parseBookmarks("")).toBeNull();
    expect(parseBookmarks("{x")).toBeNull();
  });
  it("문자열 배열이 아니면 null", () => {
    expect(parseBookmarks(JSON.stringify({ a: 1 }))).toBeNull();
    expect(parseBookmarks(JSON.stringify([1, 2, 3]))).toBeNull();
  });
  it("slug 문자열만 남긴다(빈 문자열 제거, 중복 제거, 순서 유지)", () => {
    const p = parseBookmarks(JSON.stringify(["a", "", "b", "a"]));
    expect(p).toEqual(["a", "b"]);
  });
});

describe("toggleBookmark", () => {
  it("없으면 추가(맨 앞)", () => {
    expect(toggleBookmark(["a", "b"], "c")).toEqual(["c", "a", "b"]);
  });
  it("있으면 제거", () => {
    expect(toggleBookmark(["a", "b", "c"], "b")).toEqual(["a", "c"]);
  });
  it("최대 개수 초과 시 오래된 것(끝)부터 버린다", () => {
    const filled = Array.from({ length: MAX_BOOKMARKS }, (_, i) => `s${i}`);
    const next = toggleBookmark(filled, "new");
    expect(next[0]).toBe("new");
    expect(next).toHaveLength(MAX_BOOKMARKS);
    expect(next).not.toContain(`s${MAX_BOOKMARKS - 1}`); // 가장 오래된 것 제거
  });
});

describe("DEFAULT 한계", () => {
  it("MAX_BOOKMARKS 는 양수", () => {
    expect(MAX_BOOKMARKS).toBeGreaterThan(0);
  });
});
