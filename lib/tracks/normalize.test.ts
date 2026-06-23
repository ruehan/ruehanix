import { describe, expect, it } from "vitest";
import { normalizeTracks } from "./normalize";

describe("normalizeTracks", () => {
  it("완전한 문서를 Track으로 매핑", () => {
    const out = normalizeTracks([{ videoId: "jfKfPfyJRdk", title: "lofi", artist: "Lofi Girl", order: 1 }]);
    expect(out).toEqual([{ videoId: "jfKfPfyJRdk", title: "lofi", artist: "Lofi Girl" }]);
  });
  it("videoId 형식이 어긋난 곡은 제외(11자 영숫자/-/_ 아님)", () => {
    const out = normalizeTracks([
      { videoId: "short", title: "a", artist: "b" }, // 너무 짧음
      { videoId: "https://youtu.be/jfKfPfyJRdk", title: "c", artist: "d" }, // URL 통째
      { videoId: "jfKfPfyJRdk", title: "ok", artist: "e" }, // 정상
    ]);
    expect(out).toEqual([{ videoId: "jfKfPfyJRdk", title: "ok", artist: "e" }]);
  });
  it("제목/아티스트 누락 시 안전 기본값", () => {
    const out = normalizeTracks([{ videoId: "dQw4w9WgXcQ" }]);
    expect(out).toEqual([{ videoId: "dQw4w9WgXcQ", title: "(제목 없음)", artist: "" }]);
  });
  it("빈/비배열 입력은 빈 배열", () => {
    expect(normalizeTracks([])).toEqual([]);
    expect(normalizeTracks(undefined)).toEqual([]);
  });
});
