import type { AppKey, Gutter, Rect } from "./types";

export interface Viewport {
  W: number;
  H: number;
}

/**
 * waybar/갭을 제외한 타일 배치 가능 영역.
 * bottomReserve: 하단에 비워둘 공간(px). 데스크톱 독이 타일 창을 가리지 않도록 자리를 확보한다.
 */
export function area({ W, H }: Viewport, gap: number, bottomReserve = 0): Rect {
  const m = Math.max(6, gap + 2);
  const top = 8 + 34 + 8;
  return { x: m, y: top, w: W - m * 2, h: H - top - m - bottomReserve };
}

/**
 * 현재 워크스페이스의 창들을 이진 분할(가로↔세로 번갈아)로 타일링한다.
 * Hyprland dwindle 레이아웃을 모사. 마지막 창이 남은 영역을 채운다.
 */
export function computeLayout(
  ids: AppKey[],
  full: Rect,
  ratios: Record<string, number>,
  ws: number,
  gap: number,
): { rects: Partial<Record<AppKey, Rect>>; gutters: Gutter[] } {
  const rects: Partial<Record<AppKey, Rect>> = {};
  const gutters: Gutter[] = [];
  const g = Math.max(2, gap);
  if (ids.length === 0) return { rects, gutters };

  let R: Rect = { ...full };
  let dir: "v" | "h" = "v";
  for (let i = 0; i < ids.length; i++) {
    if (i === ids.length - 1) {
      rects[ids[i]] = { ...R };
      break;
    }
    const key = ws + ":" + i;
    const ratio = ratios[key] ?? 0.5;
    if (dir === "v") {
      const wA = Math.round(R.w * ratio);
      rects[ids[i]] = { x: R.x, y: R.y, w: wA - g / 2, h: R.h };
      gutters.push({ key, dir, total: R.w, x: R.x + wA - g / 2, y: R.y, w: g, h: R.h });
      R = { x: R.x + wA + g / 2, y: R.y, w: R.w - wA - g / 2, h: R.h };
    } else {
      const hA = Math.round(R.h * ratio);
      rects[ids[i]] = { x: R.x, y: R.y, w: R.w, h: hA - g / 2 };
      gutters.push({ key, dir, total: R.h, x: R.x, y: R.y + hA - g / 2, w: R.w, h: g });
      R = { x: R.x, y: R.y + hA + g / 2, w: R.w, h: R.h - hA - g / 2 };
    }
    dir = dir === "v" ? "h" : "v";
  }
  return { rects, gutters };
}
