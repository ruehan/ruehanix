/**
 * FilesApp 정렬. 순수 — 입력 배열 immutability.
 * tie-breaker: 제목 정렬 시 동일하면 publishedAt desc.
 */
export type SortKey = "date-desc" | "date-asc" | "title-asc" | "title-desc";

/** Posts 가 정렬되기 위한 최소 형태. RowPost 등 다른 타입이 이 인덱스 시그니처를
 *  구현하면 sortPosts 의 인자로 통과 가능. */
export interface SortablePost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  catLabel: string;
  catColor: string;
  rowBg: string;
  open: () => void;
}

/** 인덱스 시그니처 — generic 제약 대신 인덱스로 매칭. RowPost 처럼 추가 필드
 *  가진 타입도 통과. */
export function sortPosts<T extends { title: string; date: string }>(posts: T[], key: SortKey): T[] {
  const out = posts.slice();
  switch (key) {
    case "date-desc":
      out.sort((a, b) => b.date.localeCompare(a.date));
      break;
    case "date-asc":
      out.sort((a, b) => a.date.localeCompare(b.date));
      break;
    case "title-asc":
      out.sort((a, b) => a.title.localeCompare(b.title, "ko") || b.date.localeCompare(a.date));
      break;
    case "title-desc":
      out.sort((a, b) => b.title.localeCompare(a.title, "ko") || b.date.localeCompare(a.date));
      break;
  }
  return out;
}