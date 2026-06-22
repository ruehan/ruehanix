import type { Rect } from "./types";
import type { Viewport } from "./layout";

/** 이 폭 미만이면 모바일(풀스크린 단일 앱 + 하단 독) 모드로 전환한다. */
export const MOBILE_BREAKPOINT = 768;

/** 모바일 상단바 / 하단 독 높이(px). */
export const MOBILE_TOPBAR = 40;
export const MOBILE_DOCK = 64;

/** 폭 기준으로 모바일 여부를 판정한다(포인터 종류와 무관). */
export function isMobileWidth(W: number): boolean {
  return W < MOBILE_BREAKPOINT;
}

/** 모바일에서 포커스된 앱이 차지하는 풀스크린 영역(상단바 아래 ~ 독 위). */
export function mobileAppRect(vp: Viewport): Rect {
  // 극단적으로 낮은 뷰포트(상단바+독 합보다 작음)에서도 높이가 음수가 되지 않게 방어한다.
  const h = Math.max(0, vp.H - MOBILE_TOPBAR - MOBILE_DOCK);
  return { x: 0, y: MOBILE_TOPBAR, w: vp.W, h };
}
