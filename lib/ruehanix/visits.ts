import { useSyncExternalStore } from "react";
import { VISIT_STORAGE_KEY, parseVisits, recordVisit, serializeVisits } from "./visit-storage";

/**
 * 최근 방문 글(LRU) 외부 스토어. recordVisitStore 로 방문을 기록하고 useVisits 로 구독.
 * localStorage write-through + useSyncExternalStore(토스트/북마크와 동일 패턴).
 * 순수 로직(recordVisit)은 visit-storage 가 담당. SSR 안전(서버 스냅샷 빈 배열).
 */

let current: string[] = load();
const listeners = new Set<() => void>();

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return parseVisits(window.localStorage.getItem(VISIT_STORAGE_KEY)) ?? [];
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
      window.localStorage.setItem(VISIT_STORAGE_KEY, serializeVisits(next));
    } catch {
      /* 무시 */
    }
  }
  emit();
}

export function getVisits(): string[] {
  return current;
}
export function subscribeVisits(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
export function recordVisitStore(slug: string): void {
  commit(recordVisit(current, slug));
}
export function useVisits(): string[] {
  return useSyncExternalStore(subscribeVisits, getVisits, () => []);
}
