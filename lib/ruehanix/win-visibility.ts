import type { CSSProperties } from "react";

/**
 * vm.tiles[app] 의 display 가 "none" 인지 검사.
 * "none" 이면 visible 아님 (true). 그 외 (block 등) 는 visible.
 * 다른 표시 속성(visibility, transform)은 의도 무시 — 부수효과 없음.
 */
export function isHidden(style: CSSProperties | undefined): boolean {
  return style?.display === "none";
}