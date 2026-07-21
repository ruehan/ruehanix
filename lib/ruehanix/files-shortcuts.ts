/**
 * FilesApp 사이드바의 카테고리/정렬 단축키 표시용 매핑.
 *
 * 디자인 HTML(`/tmp/filesapp-redesign.html`)의 kbd chip 표시와 1:1 대응.
 * — 카테고리: all/dev/sim/moto/music/blog → ⌘1~⌘6
 * — 정렬: latest/oldest/title a→z/title z→a → ⌘⇧L / ⌘⇧O / ⌘⇧A / ⌘⇧Z
 *
 * 단축키 자체의 키바인딩 핸들러는 셸(useRuehanix) 영역이라 여기선 표시 라벨만
 * 노출한다. 매핑 누락 시 빈 문자열을 반환해 row 의 우측 kbd 칩이 사라진다.
 *
 * 순수 함수 — 입력 키에 대해 결정적 출력. 단위 테스트로 회귀 잠금.
 */
import type { CatKey } from "./types";
import type { SortKey } from "./files-sort";

const CAT_SHORTCUTS: Record<CatKey | "all", string> = {
  all: "⌘1",
  dev: "⌘2",
  sim: "⌘3",
  moto: "⌘4",
  music: "⌘5",
  blog: "⌘6",
};

const SORT_SHORTCUTS: Record<SortKey, string> = {
  "date-desc": "⌘⇧L",
  "date-asc": "⌘⇧O",
  "title-asc": "⌘⇧A",
  "title-desc": "⌘⇧Z",
};

export function catShortcut(key: CatKey | "all"): string {
  return CAT_SHORTCUTS[key] ?? "";
}

export function sortShortcut(key: SortKey): string {
  return SORT_SHORTCUTS[key] ?? "";
}