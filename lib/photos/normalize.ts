import type { Photo } from "@/lib/ruehanix/types";
import type { SanityPhotoDoc } from "./types";

/** Sanity photo 문서 배열 → Photo 배열. asset 이 없는 항목은 제외. */
export function normalizePhotos(docs: SanityPhotoDoc[] | undefined): Photo[] {
  if (!Array.isArray(docs)) return [];
  const out: Photo[] = [];
  for (const d of docs) {
    if (!d?.asset) continue;
    out.push({
      asset: d.asset,
      title: d.title ?? "",
      tag: d.tag ?? "",
      folder: typeof d.folder === "string" && d.folder.trim() ? d.folder.trim() : undefined,
      description: typeof d.description === "string" && d.description.trim() ? d.description.trim() : undefined,
    });
  }
  return out;
}
