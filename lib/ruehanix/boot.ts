/** 세션당 1회만 부팅 애니메이션을 보여주기 위한 sessionStorage 키. */
export const BOOT_SESSION_KEY = "rh-booted";

/** 부팅 애니메이션을 재생할지 결정한다.
 *  이미 이번 세션에 부팅했거나(booted) 모션 최소화 선호(reducedMotion)면 건너뛴다. */
export function shouldPlayBoot(booted: boolean, reducedMotion: boolean): boolean {
  return !booted && !reducedMotion;
}
