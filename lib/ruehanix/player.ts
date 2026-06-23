import type { PlayerState, Repeat } from "./types";

/** 플레이어 기본 상태. repeat "all" → 끝까지 가도 끊기지 않고 처음으로 순환(상시 재생 의도). */
export const PLAYER_INITIAL: PlayerState = { index: 0, playing: false, volume: 80, repeat: "all" };

const REPEATS: Repeat[] = ["off", "all", "one"];

/** 빈 플레이리스트일 때의 안전 상태(정지·인덱스 0). */
function silent(s: PlayerState): PlayerState {
  return { ...s, index: 0, playing: false };
}

/** 저장된 index가 곡 수 범위를 벗어났을 때 유효 범위로 클램프.
 *  뷰모델 표시(min(index, n-1))와 동일 기준이라 표시 곡과 스킵 동작이 일치한다. */
function clampIdx(i: number, n: number): number {
  return Math.min(Math.max(0, i), n - 1);
}

/** 다음 곡(사용자 스킵) — 마지막에서 첫 곡으로 순환, 항상 재생. */
export function playerNext(s: PlayerState, n: number): PlayerState {
  if (n <= 0) return silent(s);
  return { ...s, index: (clampIdx(s.index, n) + 1) % n, playing: true };
}

/** 이전 곡(사용자 스킵) — 첫 곡에서 마지막으로 순환, 항상 재생. */
export function playerPrev(s: PlayerState, n: number): PlayerState {
  if (n <= 0) return silent(s);
  return { ...s, index: (clampIdx(s.index, n) - 1 + n) % n, playing: true };
}

/** 특정 곡 선택 — 범위 밖이면 무시(상태 유지). */
export function selectTrack(s: PlayerState, i: number, n: number): PlayerState {
  if (!Number.isInteger(i) || i < 0 || i >= n) return s;
  return { ...s, index: i, playing: true };
}

/** 재생/정지 토글. */
export function toggle(s: PlayerState): PlayerState {
  return { ...s, playing: !s.playing };
}

/** 볼륨 설정 — 0..100 클램프 + 정수 반올림. */
export function setVolume(s: PlayerState, v: number): PlayerState {
  return { ...s, volume: Math.round(Math.max(0, Math.min(100, v))) };
}

/** 반복 모드 순환: off → all → one → off. */
export function cycleRepeat(s: PlayerState): PlayerState {
  const i = REPEATS.indexOf(s.repeat);
  return { ...s, repeat: REPEATS[(i + 1) % REPEATS.length] };
}

/** 곡이 자연 종료됐을 때 — 반복 모드를 반영해 다음 상태를 만든다. */
export function onEnded(s: PlayerState, n: number): PlayerState {
  if (n <= 0) return silent(s);
  const i = clampIdx(s.index, n);
  if (s.repeat === "one") return { ...s, index: i, playing: true };
  const last = i >= n - 1;
  if (s.repeat === "off" && last) return { ...s, index: i, playing: false };
  return { ...s, index: (i + 1) % n, playing: true };
}
