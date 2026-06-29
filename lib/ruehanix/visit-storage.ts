/** 최근 방문 글 slug(LRU) localStorage 직렬화/검증 + 순수 기록.
 *  검증 패턴은 ui-storage 와 대칭. 외부 스토어(visits.ts)가 이 순수 함수들을 사용. */

export const VISIT_STORAGE_KEY = "rh-visits";
export const MAX_VISITS = 8;

/** 저장 JSON → slug 배열. 비문자열/형식 어긋나면 null. 빈 slug·중복 제거(순서 유지). */
export function parseVisits(raw: string | null | undefined): string[] | null {
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

export function serializeVisits(list: string[]): string {
  return JSON.stringify(list);
}

/** 방문 기록(LRU) — slug 를 맨 앞으로. 이미 있으면 이동. MAX 초과 시 끝(가장 오래된)부터 버림. 순수. */
export function recordVisit(list: string[], slug: string): string[] {
  const trimmed = slug.trim();
  if (!trimmed) return list;
  const without = list.filter((s) => s !== trimmed);
  const next = [trimmed, ...without];
  return next.length > MAX_VISITS ? next.slice(0, MAX_VISITS) : next;
}
