import type { Photo } from "@/lib/ruehanix/types";
import type { SanityPhotoDoc } from "./types";

/** Sanity photo 문서 배열 → Photo 배열. url(이미지)이 없는 항목은 제외. */
export function normalizePhotos(docs: SanityPhotoDoc[] | undefined): Photo[] {
  if (!Array.isArray(docs)) return [];
  const out: Photo[] = [];
  for (const d of docs) {
    if (typeof d?.url !== "string" || !d.url) continue;
    out.push({ url: d.url, title: d.title ?? "", tag: d.tag ?? "" });
  }
  return out;
}
