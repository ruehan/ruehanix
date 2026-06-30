import { describe, expect, it } from "vitest";
import { normalizeAlbums } from "./normalize";

describe("normalizeAlbums", () => {
  it("제목·artistId 있는 문서만 Album으로", () => {
    const docs = [
      { id: "a1", title: "앨범 A", coverUrl: "u", year: "2023", artistId: "art1" },
      { id: "a2", title: "앨범 B", artistId: "art2" },
    ];
    expect(normalizeAlbums(docs)).toEqual([
      { id: "a1", title: "앨범 A", coverUrl: "u", year: "2023", artistId: "art1" },
      { id: "a2", title: "앨범 B", coverUrl: "", year: "", artistId: "art2" },
    ]);
  });
  it("제목 없거나 artistId 없으면 제외(조인 불가)", () => {
    expect(normalizeAlbums([{ id: "x", artistId: "art1" }, { title: "Y", id: "y" }])).toEqual([]);
  });
  it("빈/비배열은 빈 배열", () => {
    expect(normalizeAlbums(undefined)).toEqual([]);
    expect(normalizeAlbums([])).toEqual([]);
  });
});
