import { DEFAULT_UI, parseUiState } from "./ui-storage";
import type { CatKey, ThemeMode, WallpaperKey } from "./types";

/** Catppuccin Mocha(다크) → Latte(라이트) 색 매핑. accent 팔레트 + 위젯 보조색 전체. */
export const MOCHA_TO_LATTE: Record<string, string> = {
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
    ? { dev: "#1e66f5", sim: "#d20f39", moto: "#fe640b", music: "#8839ef", blog: "#40a02b" }
    : { dev: "#89b4fa", sim: "#f38ba8", moto: "#fab387", music: "#cba6f7", blog: "#a6e3a1" };
}

/** 단일 배경화면 프리셋. 라이트/다크 각 1개의 background 문자열을 만든다.
 *  SettingsApp 의 배경화면 탭이 이들을 옵션으로 노출한다(ADR 0062). */
export interface WallpaperOption {
  key: WallpaperKey;
  name: string;
  description: string;
  /** 라이트/다크 모드와 accent 를 받아 CSS background 문자열을 만든다. */
  background: (lightMode: boolean, accent: string) => string;
}

const auroraBackground = (lightMode: boolean, accent: string): string =>
  lightMode
    ? `radial-gradient(120% 110% at 12% 6%, ${hexA(accent, 0.3)} 0%, rgba(0,0,0,0) 50%), radial-gradient(120% 120% at 92% 96%, ${hexA(accent, 0.22)} 0%, rgba(0,0,0,0) 52%), linear-gradient(160deg, #f3f4f8 0%, #e6e9ef 55%, #dce0e8 100%)`
    : `radial-gradient(120% 110% at 12% 6%, ${hexA(accent, 0.2)} 0%, rgba(0,0,0,0) 50%), radial-gradient(120% 120% at 92% 96%, ${hexA(accent, 0.16)} 0%, rgba(0,0,0,0) 52%), linear-gradient(160deg, #1e1e2e 0%, #181825 55%, #11111b 100%)`;

/** 프리셋 5종 — Aurora / Deep Space / Sunset / Forest / Mono.
 *  SettingsApp 사이드바의 배경화면 탭에서 카드로 보여준다. 순서는 SETTINGS_TABS 와 동일한 표시 순서. */
export const WALLPAPERS: WallpaperOption[] = [
  {
    key: "aurora",
    name: "오로라",
    description: "강조색을 비춘 부드러운 빛. 기본값.",
    background: auroraBackground,
  },
  {
    key: "deep-space",
    name: "딥 스페이스",
    description: "차분한 보라·네이비 그라디언트.",
    background: (_light, _accent) =>
      _light
        ? "radial-gradient(120% 110% at 18% 8%, #e6e6f5 0%, rgba(0,0,0,0) 55%), linear-gradient(160deg, #e8eaf5 0%, #d8dce8 55%, #c8cce0 100%)"
        : "radial-gradient(120% 110% at 18% 8%, #3a3a6e 0%, rgba(0,0,0,0) 55%), linear-gradient(160deg, #1e1e3e 0%, #15152a 55%, #0f0f23 100%)",
  },
  {
    key: "sunset",
    name: "선셋",
    description: "따뜻한 오렌지·핑크 노을.",
    background: (_light, _accent) =>
      _light
        ? "radial-gradient(120% 110% at 18% 8%, #ffd9c2 0%, rgba(0,0,0,0) 55%), linear-gradient(160deg, #ffe4cc 0%, #ffd1d8 55%, #f7c6cc 100%)"
        : "radial-gradient(120% 110% at 18% 8%, #5a3a4e 0%, rgba(0,0,0,0) 55%), linear-gradient(160deg, #3a1e2e 0%, #2a1428 55%, #1e1230 100%)",
  },
  {
    key: "forest",
    name: "포레스트",
    description: "녹색 그늘, 차분한 산림 톤.",
    background: (_light, _accent) =>
      _light
        ? "radial-gradient(120% 110% at 18% 8%, #d8e4d4 0%, rgba(0,0,0,0) 55%), linear-gradient(160deg, #dce6d4 0%, #c8d4c4 55%, #b6c4b2 100%)"
        : "radial-gradient(120% 110% at 18% 8%, #1e3a2a 0%, rgba(0,0,0,0) 55%), linear-gradient(160deg, #14241a 0%, #0f1f15 55%, #0a1410 100%)",
  },
  {
    key: "mono",
    name: "모노",
    description: "단색 · 가장 빠르고 정적.",
    background: (_light, _accent) =>
      _light
        ? "linear-gradient(160deg, #f3f4f8 0%, #e6e9ef 55%, #dce0e8 100%)"
        : "linear-gradient(160deg, #1e1e2e 0%, #181825 55%, #11111b 100%)",
  },
];

/** 키 → 옵션 매핑. viewModel 이 wallpaperKey 로 색을 찾을 때 사용. */
const WALLPAPER_BY_KEY: Record<WallpaperKey, WallpaperOption> = WALLPAPERS.reduce(
  (acc, w) => {
    acc[w.key] = w;
    return acc;
  },
  {} as Record<WallpaperKey, WallpaperOption>,
);

/** 데스크톱 배경 그라디언트. 키·라이트 모드·강조색으로 결정(ADR 0062). */
export function wallpaper(key: WallpaperKey, lightMode: boolean, accent: string): string {
  return WALLPAPER_BY_KEY[key].background(lightMode, accent);
}

/** UI 설정 저장값(원본 문자열)에서 페인트 전 적용할 테마를 결정.
 *  인라인 head 스크립트와 useRuehanix 복원이 같은 결과를 내도록 하는 단일 진실 소스.
 *  깨지거나 없는 저장값은 기본값(dark, DEFAULT_UI.accent)으로 떨어진다. */
export function resolveEarlyTheme(rawUi: string | null, prefersLight: boolean): { light: boolean; accent: string } {
  const ui = parseUiState(rawUi) ?? DEFAULT_UI;
  const light = effMode(ui.mode, prefersLight) === "light";
  return { light, accent: light ? MOCHA_TO_LATTE[ui.accent] ?? ui.accent : ui.accent };
}
