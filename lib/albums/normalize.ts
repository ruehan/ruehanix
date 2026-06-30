import type { Album } from "@/lib/ruehanix/types";
import type { SanityAlbumDoc } from "./types";

/** Sanity album 문서 배열 → Album 배열. 제목이 없거나 artistId가 없는 문서는 제외
 *  (아티스트 조인이 불가하므로). */
export function normalizeAlbums(docs: SanityAlbumDoc[] | undefined): Album[] {
  if (!Array.isArray(docs)) return [];
  const out: Album[] = [];
  for (const d of docs) {
    if (!d || typeof d.title !== "string" || !d.title) continue;
    const artistId = typeof d.artistId === "string" ? d.artistId : "";
    if (!artistId) continue;
    out.push({
      id: typeof d.id === "string" ? d.id : "",
      title: d.title,
      coverUrl: typeof d.coverUrl === "string" ? d.coverUrl : "",
      year: typeof d.year === "string" ? d.year : "",
      artistId,
    });
  }
  return out;
}
