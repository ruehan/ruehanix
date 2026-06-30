import { toArtistInfo } from "@/lib/artists/normalize";
import type { Track } from "@/lib/ruehanix/types";
import type { SanityTrackDoc } from "./types";

/** YouTube 영상 ID 11자(영숫자·-·_). */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

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
      albumId: d.albumRef && typeof d.albumRef._id === "string" ? d.albumRef._id : null,
    });
  }
  return out;
}
