import type { Album, ArtistInfo, ArtistView, SongRef, Track } from "@/lib/ruehanix/types";

/** 아티스트 상세 뷰를 조인(순수). tracks 중 artistInfo.id === artist 인 곡을 모으고,
 *  albumId로 앨범 수록곡을 그룹화. 앨범에 속하지 않거나 앨범을 찾을 수 없는 곡은 songs 로.
 *  - 재생 인덱스(index) = 전체 tracks 내 원래 위치.
 *  - 앨범은 year 오름차순(빈 year는 뒤).
 *  - artistInfo가 null이면 조인 불가 → 그 아티스트에 속하지 않는다.
 */
export function buildArtistViews(artists: ArtistInfo[], albums: Album[], tracks: Track[]): ArtistView[] {
  const albumById = new Map(albums.map((a) => [a.id, a]));
  return artists.map((info) => {
    // 이 아티스트의 곡(전체 tracks 내 인덱스와 함께).
    const mine: { track: Track; index: number }[] = [];
    tracks.forEach((t, index) => {
      if (t.artistInfo && t.artistInfo.id === info.id) mine.push({ track: t, index });
    });
    const songRef = ({ track, index }: { track: Track; index: number }): SongRef => ({
      index,
      title: track.title,
      artist: track.artist,
    });

    // 앨범별 수록곡 그룹화 — album이 존재하고 **소속 아티스트가 같을 때만** 앨범에 붙인다.
    // (컴필레이션/피처링 등 앨범 artistId가 다르면 그 곡은 앨범에서 빼고 songs 로 폴백 — 증발 방지.)
    const byAlbum = new Map<string, SongRef[]>();
    const loose: SongRef[] = [];
    for (const m of mine) {
      const aid = m.track.albumId;
      const album = aid ? albumById.get(aid) : undefined;
      if (album && album.artistId === info.id) {
        const arr = byAlbum.get(album.id) ?? [];
        arr.push(songRef(m));
        byAlbum.set(album.id, arr);
      } else {
        loose.push(songRef(m));
      }
    }

    const artistAlbums = albums
      .filter((a) => a.artistId === info.id)
      .map((a) => ({ id: a.id, title: a.title, coverUrl: a.coverUrl, year: a.year, songs: byAlbum.get(a.id) ?? [] }))
      .sort((x, y) => yearCmp(x.year, y.year));

    return { info, albums: artistAlbums, songs: loose };
  });
}

function yearCmp(a: string, b: string): number {
  // 빈 year는 뒤로. 같은 형식(4자리 연도) 가정해 문자열 사전순 비교.
  const ay = a.trim();
  const by = b.trim();
  if (!ay && !by) return 0;
  if (!ay) return 1;
  if (!by) return -1;
  return ay < by ? -1 : ay > by ? 1 : 0;
}
