import { useSyncExternalStore } from "react";
import { BOOKMARK_STORAGE_KEY, parseBookmarks, serializeBookmarks, toggleBookmark } from "./bookmark-storage";

/**
 * 북마크 글 외부 스토어. 어디서든 toggleBookmarkStore/isBookmarked/useBookmarks 로 접근.
 * 상태는 localStorage에 write-through, useSyncExternalStore 로 구독(ADR: 토스트와 동일 패턴).
 * SSR 안전: 서버 스냅샷은 빈 배열. 순수 로직은 bookmark-storage 이 담당(테스트 대상).
 */

let current: string[] = load();
const listeners = new Set<() => void>();

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return parseBookmarks(window.localStorage.getItem(BOOKMARK_STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
}
function emit() {
  for (const l of listeners) l();
}
function commit(next: string[]) {
  current = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(BOOKMARK_STORAGE_KEY, serializeBookmarks(next));
    } catch {
      /* 무시 */
    }
  }
  emit();
}

export function getBookmarks(): string[] {
  return current;
}
export function subscribeBookmarks(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
export function isBookmarked(slug: string): boolean {
  return current.includes(slug);
}
export function toggleBookmarkStore(slug: string): void {
  commit(toggleBookmark(current, slug));
}
export function useBookmarks(): string[] {
  return useSyncExternalStore(subscribeBookmarks, getBookmarks, () => []);
}
