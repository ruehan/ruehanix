import type { ArtistInfo, Track } from "@/lib/ruehanix/types";
import type { SanityArtistRef, SanityTrackDoc } from "./types";

/** YouTube 영상 ID 11자(영숫자·-·_). */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

/** track.artistRef 역참조 → ArtistInfo. 이름이 없으면(역참조 실패·빈 참조) null. */
function toArtistInfo(a: SanityArtistRef | null | undefined): ArtistInfo | null {
  if (!a || typeof a.name !== "string" || !a.name) return null;
  const links = Array.isArray(a.links)
    ? a.links.filter((l): l is { label: string; url: string } => !!l && typeof l.label === "string" && !!l.label && typeof l.url === "string" && !!l.url)
    : [];
  return {
    name: a.name,
    photoUrl: typeof a.photoUrl === "string" ? a.photoUrl : "",
    bio: a.bio ?? "",
    genre: a.genre ?? "",
    origin: a.origin ?? "",
    links: links.map((l) => ({ label: l.label, url: l.url })),
  };
}

/** Sanity track 문서 배열 → Track 배열. videoId가 유효하지 않은 곡은 제외(재생 불가하므로). */
export function normalizeTracks(docs: SanityTrackDoc[] | undefined): Track[] {
  if (!Array.isArray(docs)) return [];
  const out: Track[] = [];
  for (const d of docs) {
    const videoId = d?.videoId;
    if (typeof videoId !== "string" || !YOUTUBE_ID.test(videoId)) continue;
    out.push({
      videoId,
      title: d.title ?? "(제목 없음)",
      artist: d.artist ?? "",
      artistInfo: toArtistInfo(d.artistRef),
    });
  }
  return out;
}
