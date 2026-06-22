/** 첫 방문 힌트(독 안내 말풍선)를 보여줄지 결정한다.
 *  데스크톱에서, 부팅이 끝났고, 아직 본 적 없을 때만 표시한다. */
export function shouldShowHint(params: { seen: boolean; booting: boolean; isMobile: boolean }): boolean {
  return !params.seen && !params.booting && !params.isMobile;
}

/** 힌트 1회성 플래그를 저장하는 localStorage 키. */
export const HINT_STORAGE_KEY = "rh-apps-hint-seen";
