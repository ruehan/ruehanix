import { describe, expect, it } from "vitest";
import {
  PLAYER_INITIAL,
  cycleRepeat,
  onEnded,
  playerNext,
  playerPrev,
  selectTrack,
  setVolume,
  toggle,
} from "./player";
import type { PlayerState } from "./types";

const N = 3; // 곡 3개짜리 플레이리스트 가정
const base: PlayerState = { index: 0, playing: false, volume: 80, repeat: "all" };

describe("playerNext / playerPrev (사용자 스킵)", () => {
  it("next는 다음 곡으로, 마지막에서 첫 곡으로 순환", () => {
    expect(playerNext({ ...base, index: 0 }, N).index).toBe(1);
    expect(playerNext({ ...base, index: 2 }, N).index).toBe(0);
  });
  it("prev는 이전 곡으로, 첫 곡에서 마지막으로 순환", () => {
    expect(playerPrev({ ...base, index: 0 }, N).index).toBe(2);
    expect(playerPrev({ ...base, index: 2 }, N).index).toBe(1);
  });
  it("스킵하면 항상 재생 상태가 된다", () => {
    expect(playerNext({ ...base, playing: false }, N).playing).toBe(true);
    expect(playerPrev({ ...base, playing: false }, N).playing).toBe(true);
  });
  it("빈 플레이리스트(n=0)면 index 0 · 정지 유지", () => {
    expect(playerNext({ ...base, index: 0 }, 0)).toMatchObject({ index: 0, playing: false });
    expect(playerPrev({ ...base, index: 0 }, 0)).toMatchObject({ index: 0, playing: false });
  });
});

describe("범위 밖 저장 index 정규화 (곡 수가 줄어든 경우)", () => {
  // 표시(viewModel은 min(index, n-1)로 클램프)와 reducer 계산 기준을 일치시켜야 한다.
  it("playerNext: index=4·n=3이면 표시곡(2) 기준 다음 곡(0)", () => {
    expect(playerNext({ ...base, index: 4 }, 3).index).toBe(0);
  });
  it("playerPrev: index=4·n=3이면 표시곡(2) 기준 이전 곡(1)", () => {
    expect(playerPrev({ ...base, index: 4 }, 3).index).toBe(1);
  });
  it("playerNext: index=10·n=3도 표시곡(2) 기준 0", () => {
    expect(playerNext({ ...base, index: 10 }, 3).index).toBe(0);
  });
  it("onEnded all: index=4·n=3이면 표시곡(2)이 마지막 → 0으로 순환", () => {
    expect(onEnded({ ...base, index: 4, repeat: "all" }, 3)).toMatchObject({ index: 0, playing: true });
  });
  it("onEnded off: index=4·n=3이면 표시곡(2)이 마지막 → 정지 + index 정규화(2)", () => {
    expect(onEnded({ ...base, index: 4, repeat: "off" }, 3)).toMatchObject({ index: 2, playing: false });
  });
  it("onEnded one: index=4·n=3이면 표시곡(2) 정규화 후 같은 곡 재생", () => {
    expect(onEnded({ ...base, index: 4, repeat: "one" }, 3)).toMatchObject({ index: 2, playing: true });
  });
});

describe("selectTrack", () => {
  it("고른 곡으로 이동하고 재생", () => {
    expect(selectTrack(base, 2, N)).toMatchObject({ index: 2, playing: true });
  });
  it("범위 밖 인덱스는 무시(상태 유지)", () => {
    expect(selectTrack({ ...base, index: 1 }, 9, N).index).toBe(1);
    expect(selectTrack({ ...base, index: 1 }, -1, N).index).toBe(1);
  });
});

describe("toggle / setVolume", () => {
  it("toggle은 재생/정지를 뒤집는다", () => {
    expect(toggle({ ...base, playing: false }).playing).toBe(true);
    expect(toggle({ ...base, playing: true }).playing).toBe(false);
  });
  it("setVolume은 0..100으로 클램프", () => {
    expect(setVolume(base, 50).volume).toBe(50);
    expect(setVolume(base, 130).volume).toBe(100);
    expect(setVolume(base, -5).volume).toBe(0);
  });
  it("setVolume은 정수로 반올림", () => {
    expect(setVolume(base, 33.6).volume).toBe(34);
  });
});

describe("cycleRepeat", () => {
  it("off → all → one → off 순환", () => {
    expect(cycleRepeat({ ...base, repeat: "off" }).repeat).toBe("all");
    expect(cycleRepeat({ ...base, repeat: "all" }).repeat).toBe("one");
    expect(cycleRepeat({ ...base, repeat: "one" }).repeat).toBe("off");
  });
});

describe("onEnded (곡 자연 종료 — 반복 모드 반영)", () => {
  it("one이면 같은 곡을 다시 재생", () => {
    expect(onEnded({ ...base, index: 1, repeat: "one" }, N)).toMatchObject({ index: 1, playing: true });
  });
  it("all이면 다음 곡으로 순환(마지막 → 첫 곡)", () => {
    expect(onEnded({ ...base, index: 2, repeat: "all" }, N)).toMatchObject({ index: 0, playing: true });
  });
  it("off이고 마지막 곡이면 정지", () => {
    expect(onEnded({ ...base, index: 2, repeat: "off" }, N)).toMatchObject({ index: 2, playing: false });
  });
  it("off이고 마지막이 아니면 다음 곡 재생", () => {
    expect(onEnded({ ...base, index: 0, repeat: "off" }, N)).toMatchObject({ index: 1, playing: true });
  });
  it("빈 플레이리스트면 정지", () => {
    expect(onEnded({ ...base, repeat: "all" }, 0).playing).toBe(false);
  });
});
