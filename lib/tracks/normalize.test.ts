import { describe, expect, it } from "vitest";
import { normalizeTracks } from "./normalize";

describe("normalizeTracks", () => {
  it("완전한 문서를 Track으로 매핑(참조 없으면 artistInfo null)", () => {
    const out = normalizeTracks([{ videoId: "jfKfPfyJRdk", title: "lofi", artist: "Lofi Girl", order: 1 }]);
    expect(out).toEqual([{ videoId: "jfKfPfyJRdk", title: "lofi", artist: "Lofi Girl", artistInfo: null }]);
  });
  it("videoId 형식이 어긋난 곡은 제외(11자 영숫자/-/_ 아님)", () => {
    const out = normalizeTracks([
      { videoId: "short", title: "a", artist: "b" }, // 너무 짧음
      { videoId: "https://youtu.be/jfKfPfyJRdk", title: "c", artist: "d" }, // URL 통째
      { videoId: "jfKfPfyJRdk", title: "ok", artist: "e" }, // 정상
    ]);
    expect(out).toEqual([{ videoId: "jfKfPfyJRdk", title: "ok", artist: "e", artistInfo: null }]);
  });
  it("제목/아티스트 누락 시 안전 기본값", () => {
    const out = normalizeTracks([{ videoId: "dQw4w9WgXcQ" }]);
    expect(out).toEqual([{ videoId: "dQw4w9WgXcQ", title: "(제목 없음)", artist: "", artistInfo: null }]);
  });
  it("빈/비배열 입력은 빈 배열", () => {
    expect(normalizeTracks([])).toEqual([]);
    expect(normalizeTracks(undefined)).toEqual([]);
  });

  describe("artistRef → artistInfo", () => {
    it("완전한 참조를 매핑(링크는 label·url 모두 있는 것만)", () => {
      const out = normalizeTracks([
        {
          videoId: "jfKfPfyJRdk",
          title: "곡",
          artist: "라벨",
          artistRef: {
            id: "art-1",
            name: "Lofi Girl",
            photoUrl: "https://cdn/a.jpg",
            bio: "소개",
            genre: "lo-fi",
            origin: "파리",
            links: [
              { label: "공식", url: "https://x" },
              { label: "깨짐", url: undefined }, // url 없음 → 제외
              { url: "https://y" }, // label 없음 → 제외
            ],
          },
        },
      ]);
      expect(out[0].artistInfo).toEqual({
        id: "art-1",
        name: "Lofi Girl",
        photoUrl: "https://cdn/a.jpg",
        bio: "소개",
        genre: "lo-fi",
        origin: "파리",
        links: [{ label: "공식", url: "https://x" }],
      });
    });
    it("이름 없는 참조는 null(역참조 실패/빈 참조)", () => {
      expect(normalizeTracks([{ videoId: "jfKfPfyJRdk", title: "t", artist: "a", artistRef: {} }])[0].artistInfo).toBeNull();
      expect(normalizeTracks([{ videoId: "jfKfPfyJRdk", title: "t", artist: "a", artistRef: null }])[0].artistInfo).toBeNull();
    });
    it("선택 필드 누락 시 안전 기본값(빈 문자열·빈 배열)", () => {
      expect(normalizeTracks([{ videoId: "jfKfPfyJRdk", title: "t", artist: "a", artistRef: { name: "A" } }])[0].artistInfo).toEqual({
        id: "",
        name: "A",
        photoUrl: "",
        bio: "",
        genre: "",
        origin: "",
        links: [],
      });
    });
  });
});
