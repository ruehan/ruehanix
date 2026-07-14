import type { Photo } from "@/lib/ruehanix/types";

/** folder 가 없는 사진이 모이는 그룹 이름. UI 에 그대로 표시. */
export const UNCATEGORIZED = "(미분류)";

export interface PhotoGroup {
  name: string;
  photos: Photo[];
}

/**
 * Photo 배열을 folder 별로 묶는다. 정렬:
 *  - 명시 folder (비어있지 않은 string) 가 있는 그룹: 이름 사전순 (한국어 로케일).
 *  - UNCATEGORIZED: 항상 마지막.
 *  - 각 그룹 내 photos: 입력 순서 유지.
 * 빈 입력은 빈 배열.
 */
export function groupByFolder(photos: Photo[]): PhotoGroup[] {
  if (!Array.isArray(photos) || photos.length === 0) return [];
  const map = new Map<string, Photo[]>();
  for (const p of photos) {
    const key = typeof p.folder === "string" && p.folder.trim() ? p.folder.trim() : UNCATEGORIZED;
    const arr = map.get(key);
    if (arr) arr.push(p);
    else map.set(key, [p]);
  }
  const named: PhotoGroup[] = [];
  let uncategorized: PhotoGroup | null = null;
  for (const [name, photos] of map) {
    if (name === UNCATEGORIZED) uncategorized = { name, photos };
    else named.push({ name, photos });
  }
  named.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return uncategorized ? [...named, uncategorized] : named;
}