import { describe, expect, it } from "vitest";
import { buildArtistViews } from "./views";
import type { Album, ArtistInfo, Track } from "@/lib/ruehanix/types";

const artists: ArtistInfo[] = [
  { id: "a1", name: "A", photoUrl: "", bio: "", genre: "", origin: "", links: [], members: [] },
  { id: "a2", name: "B", photoUrl: "", bio: "", genre: "", origin: "", links: [], members: [] },
];
const tracks: Track[] = [
  // A의 앨범 al1 수록곡 2개 + 앨범 밖 1개
  { videoId: "t0", title: "싱글", artist: "A", artistInfo: artists[0], albumId: null },
  { videoId: "t1", title: "곡1", artist: "A", artistInfo: artists[0], albumId: "al1" },
  { videoId: "t2", title: "곡2", artist: "A", artistInfo: artists[0], albumId: "al1" },
];
const albums: Album[] = [{ id: "al1", title: "첫 앨범", coverUrl: "c", year: "2022", artistId: "a1" }];

describe("buildArtistViews", () => {
  it("아티스트별로 뷰를 구성(앨범 + 수록곡 + 앨범 밖 곡)", () => {
    const views = buildArtistViews(artists, albums, tracks);
    const a = views.find((v) => v.info.id === "a1")!;
    expect(a.info.name).toBe("A");
    // 앨범: year 오름차순, 수록곡에 재생 인덱스(전체 tracks 내 위치)
    expect(a.albums).toHaveLength(1);
    expect(a.albums[0].title).toBe("첫 앨범");
    expect(a.albums[0].songs.map((s) => s.index)).toEqual([1, 2]);
    expect(a.albums[0].songs.map((s) => s.title)).toEqual(["곡1", "곡2"]);
    // 앨범 밖 곡(싱글 등)
    expect(a.songs.map((s) => s.index)).toEqual([0]);
  });

  it("앨범은 없지만 곡만 있는 아티스트도 songs 로 노출", () => {
    const views = buildArtistViews([{ ...artists[1], id: "a2" }], [], [
      { videoId: "x1", title: "단독 곡", artist: "B", artistInfo: { ...artists[1] }, albumId: null },
    ]);
    const b = views[0];
    expect(b.albums).toEqual([]);
    expect(b.songs.map((s) => s.title)).toEqual(["단독 곡"]);
  });

  it("곡이 artistInfo 없으면 그 아티스트에 속하지 않는다(라벨만으로는 조인 불가)", () => {
    const views = buildArtistViews(artists, [], [
      { videoId: "y1", title: "라벨만", artist: "A", artistInfo: null, albumId: null },
    ]);
    expect(views.find((v) => v.info.id === "a1")?.songs ?? []).toHaveLength(0);
  });

  it("여러 앨범은 year 오름차순(비어있으면 뒤로)", () => {
    const multi: Album[] = [
      { id: "b", title: "신보", coverUrl: "", year: "2024", artistId: "a1" },
      { id: "a", title: "구보", coverUrl: "", year: "2020", artistId: "a1" },
      { id: "c", title: "연도미상", coverUrl: "", year: "", artistId: "a1" },
    ];
    const views = buildArtistViews([artists[0]], multi, []);
    expect(views[0].albums.map((a) => a.title)).toEqual(["구보", "신보", "연도미상"]);
  });

  it("albumRef가 존재하지 않는 앨범 id인 곡은 앨범에 붙지 않고 songs 로 감(또는 무시)", () => {
    // albumId가 albums에 없으면 그 곡은 앨범 수록곡이 될 수 없음 → 앨범 밖 songs 로 분류.
    const views = buildArtistViews(artists, albums, [
      { videoId: "z1", title: "고아", artist: "A", artistInfo: artists[0], albumId: "존재안함" },
    ]);
    const a = views[0];
    expect(a.albums).toHaveLength(1);
    expect(a.songs.map((s) => s.title)).toEqual(["고아"]);
  });

  it("track의 앨범이 다른 아티스트 소속(컴필/피처링)이면 songs 로 폴백(증발 방지)", () => {
    const views = buildArtistViews(
      [{ ...artists[0], id: "feat" }],
      [{ id: "al9", title: "컴필", coverUrl: "", year: "2024", artistId: "comp" }],
      [{ videoId: "v9", title: "피처곡", artist: "F", artistInfo: { ...artists[0], id: "feat" }, albumId: "al9" }],
    );
    expect(views[0].albums).toHaveLength(0);
    expect(views[0].songs.map((s) => s.title)).toEqual(["피처곡"]);
  });

  it("빈 입력", () => {
    expect(buildArtistViews([], [], [])).toEqual([]);
  });
});
