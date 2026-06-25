import type { ThemeMode, UiState } from "./types";

/** UI 설정을 영속화하는 localStorage 키. */
export const UI_STORAGE_KEY = "rh-ui";

const MODES: ThemeMode[] = ["light", "dark", "auto"];
const HEX = /^#[0-9a-fA-F]{6}$/;

/**
 * UiState 기본값. useRuehanix INITIAL.ui와 동일값이며 "기본값"의 단일 진실 소스.
 * 복원·초기화(reset)가 모두 이 값을 기준으로 동작한다.
 */
export const DEFAULT_UI: UiState = {
  mode: "dark",
  accent: "#cba6f7",
  gap: 10,
  rounded: true,
  glow: true,
  transp: false,
};

/** 저장된 JSON 문자열 → UiState. 형식/범위가 어긋나면 null(저장값 무시, 기본값 사용). */
export function parseUiState(raw: string | null | undefined): UiState | null {
  if (!raw) return null;
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!o || typeof o !== "object") return null;
  const r = o as Record<string, unknown>;

  const mode = typeof r.mode === "string" && (MODES as string[]).includes(r.mode) ? (r.mode as ThemeMode) : null;
  const accent = typeof r.accent === "string" && HEX.test(r.accent) ? r.accent : null;
  const gap = typeof r.gap === "number" && r.gap >= 0 && r.gap <= 28 ? Math.round(r.gap) : null;
  if (mode === null || accent === null || gap === null) return null;

  return {
    mode,
    accent,
    gap,
    rounded: typeof r.rounded === "boolean" ? r.rounded : true,
    glow: typeof r.glow === "boolean" ? r.glow : true,
    transp: typeof r.transp === "boolean" ? r.transp : false,
  };
}

/** UiState → 저장 문자열. */
export function serializeUiState(ui: UiState): string {
  return JSON.stringify(ui);
}
