import type { PlayerState, Repeat } from "./types";

/** 플레이어 상태를 영속화하는 localStorage 키. */
export const PLAYER_STORAGE_KEY = "rh-player";

const REPEATS: Repeat[] = ["off", "all", "one"];

/** 저장된 JSON 문자열 → PlayerState. 형식/범위가 어긋나면 null(저장값 무시, 기본값 사용).
 *  playing은 저장하지 않고 항상 false로 복원한다 — autoplay 정책상 제스처 없이 재생 불가. */
export function parsePlayerState(raw: string | null | undefined): PlayerState | null {
  if (!raw) return null;
  let o: unknown;
  try {
    o = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!o || typeof o !== "object") return null;
  const r = o as Record<string, unknown>;

  const index = typeof r.index === "number" && Number.isInteger(r.index) && r.index >= 0 ? r.index : null;
  const volume = typeof r.volume === "number" && r.volume >= 0 && r.volume <= 100 ? Math.round(r.volume) : null;
  const repeat = typeof r.repeat === "string" && (REPEATS as string[]).includes(r.repeat) ? (r.repeat as Repeat) : null;
  if (index === null || volume === null || repeat === null) return null;

  return { index, playing: false, volume, repeat };
}

/** PlayerState → 저장 문자열. playing은 복원 시 항상 false라 저장에서 제외한다. */
export function serializePlayerState(s: PlayerState): string {
  return JSON.stringify({ index: s.index, volume: s.volume, repeat: s.repeat });
}
