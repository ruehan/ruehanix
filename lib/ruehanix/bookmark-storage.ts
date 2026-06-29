/** 북마크(즐겨찾기 글 slug) localStorage 직렬화/검증 + 순수 토글.
 *  검증 패턴은 ui-storage 와 대칭. 외부 스토어(bookmarks.ts)가 이 순수 함수들을 사용. */

export const BOOKMARK_STORAGE_KEY = "rh-bookmarks";
export const MAX_BOOKMARKS = 24;

/** 저장 JSON → slug 배열. 비문자열/형식 어긋나면 null. 빈 slug·중복 제거(순서 유지). */
export function parseBookmarks(raw: string | null | undefined): string[] | null {
  if (!raw) return null;
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!Array.isArray(o)) return null;
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of o) {
    if (typeof v !== "string") return null;
    const s = v.trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

export function serializeBookmarks(list: string[]): string {
  return JSON.stringify(list);
}

/** slug 가 없으면 맨 앞에 추가, 있으면 제거. MAX 초과 시 끝(가장 오래된)부터 버린다. 순수. */
export function toggleBookmark(list: string[], slug: string): string[] {
  const trimmed = slug.trim();
  if (!trimmed) return list;
  const without = list.filter((s) => s !== trimmed);
  if (without.length === list.length) {
    // 추가
    const next = [trimmed, ...without];
    return next.length > MAX_BOOKMARKS ? next.slice(0, MAX_BOOKMARKS) : next;
  }
  return without;
}
