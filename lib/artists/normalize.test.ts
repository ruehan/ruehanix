import { describe, expect, it } from "vitest";
import { normalizeArtists, toArtistInfo } from "./normalize";

describe("toArtistInfo", () => {
  it("완전한 문서를 매핑(링크는 label·url 모두 있는 것만)", () => {
    expect(
      toArtistInfo({
        id: "a1",
        name: "Lofi Girl",
        photoUrl: "https://cdn/a.jpg",
        bio: "소개",
        genre: "lo-fi",
        origin: "파리",
        links: [
          { label: "공식", url: "https://x" },
          { label: "깨짐" }, // url 없음 → 제외
          { url: "https://y" }, // label 없음 → 제외
        ],
      }),
    ).toEqual({
      id: "a1",
      name: "Lofi Girl",
      photoUrl: "https://cdn/a.jpg",
      bio: "소개",
      genre: "lo-fi",
      origin: "파리",
      links: [{ label: "공식", url: "https://x" }],
    });
  });
  it("이름 없으면 null", () => {
    expect(toArtistInfo({})).toBeNull();
    expect(toArtistInfo(null)).toBeNull();
  });
  it("선택 필드 누락 시 안전 기본값(id·문자열은 빈, links []) ", () => {
    expect(toArtistInfo({ name: "A" })).toEqual({ id: "", name: "A", photoUrl: "", bio: "", genre: "", origin: "", links: [] });
  });
});

describe("normalizeArtists", () => {
  it("이름 있는 문서만 매핑(이름 없는 건 제외)", () => {
    const out = normalizeArtists([{ id: "a1", name: "A" }, {}, { id: "a2", name: "B" }]);
    expect(out.map((a) => a.name)).toEqual(["A", "B"]);
  });
  it("빈/비배열 입력은 빈 배열", () => {
    expect(normalizeArtists([])).toEqual([]);
    expect(normalizeArtists(undefined)).toEqual([]);
  });
});
