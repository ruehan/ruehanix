import type { CatKey, ThemeMode } from "./types";

/** Catppuccin Mocha(다크) → Latte(라이트) 색 매핑. accent 팔레트 + 위젯 보조색 전체. */
const MOCHA_TO_LATTE: Record<string, string> = {
  "#f38ba8": "#d20f39", // red
  "#fab387": "#fe640b", // peach
  "#f9e2af": "#df8e1d", // yellow
  "#a6e3a1": "#40a02b", // green
  "#94e2d5": "#179299", // teal
  "#89dceb": "#04a5e5", // sky
  "#89b4fa": "#1e66f5", // blue
  "#cba6f7": "#8839ef", // mauve
  "#f5c2e7": "#ea76cb", // pink
};

/** 모드에 맞춰 Mocha 색을 변환한다(라이트면 Latte, 다크면 원본). 매핑에 없으면 원본 유지.
 *  하드코딩 다크 팔레트를 쓰던 데스크톱 위젯이 라이트 모드에 적응하게 한다. */
export function toLatte(hex: string, lightMode: boolean): string {
  return lightMode ? MOCHA_TO_LATTE[hex] ?? hex : hex;
}

/** `auto`면 OS 선호도(prefersLight)로, 아니면 모드 그대로 light/dark를 결정한다. */
export function effMode(mode: ThemeMode, prefersLight: boolean): "light" | "dark" {
  if (mode === "auto") return prefersLight ? "light" : "dark";
  return mode;
}

/** 유효 모드에 따라 accent 색을 반환한다(라이트는 Latte 매핑). */
export function accentEff(mode: ThemeMode, accent: string, prefersLight: boolean): string {
  return effMode(mode, prefersLight) === "light" ? MOCHA_TO_LATTE[accent] ?? accent : accent;
}

/** #rrggbb + 알파 → rgba() 문자열. */
export function hexA(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

/** 카테고리 색 팔레트(라이트/다크). */
export function catColors(lightMode: boolean): Record<CatKey, string> {
  return lightMode
    ? { dev: "#1e66f5", sim: "#d20f39", moto: "#fe640b", music: "#8839ef" }
    : { dev: "#89b4fa", sim: "#f38ba8", moto: "#fab387", music: "#cba6f7" };
}

/** 데스크톱 배경 그라디언트. */
export function wallpaper(lightMode: boolean, accent: string): string {
  return lightMode
    ? `radial-gradient(120% 110% at 12% 6%, ${hexA(accent, 0.3)} 0%, rgba(0,0,0,0) 50%), radial-gradient(120% 120% at 92% 96%, ${hexA(accent, 0.22)} 0%, rgba(0,0,0,0) 52%), linear-gradient(160deg, #f3f4f8 0%, #e6e9ef 55%, #dce0e8 100%)`
    : `radial-gradient(120% 110% at 12% 6%, ${hexA(accent, 0.2)} 0%, rgba(0,0,0,0) 50%), radial-gradient(120% 120% at 92% 96%, ${hexA(accent, 0.16)} 0%, rgba(0,0,0,0) 52%), linear-gradient(160deg, #1e1e2e 0%, #181825 55%, #11111b 100%)`;
}
