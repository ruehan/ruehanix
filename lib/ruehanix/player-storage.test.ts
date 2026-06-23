import { describe, expect, it } from "vitest";
import { parsePlayerState, serializePlayerState } from "./player-storage";
import type { PlayerState } from "./types";

const valid: PlayerState = { index: 2, playing: true, volume: 55, repeat: "one" };

describe("parsePlayerState", () => {
  it("직렬화 → 파싱 라운드트립 (단 playing은 항상 false로 복원)", () => {
    // autoplay 정책상 사용자 제스처 없이 재생 불가 → 복원 시 항상 정지 상태.
    expect(parsePlayerState(serializePlayerState(valid))).toEqual({ ...valid, playing: false });
  });
  it("빈 값/잘못된 JSON은 null", () => {
    expect(parsePlayerState(null)).toBeNull();
    expect(parsePlayerState("")).toBeNull();
    expect(parsePlayerState("{nope")).toBeNull();
  });
  it("필수 필드 누락/형식 오류면 null", () => {
    expect(parsePlayerState(JSON.stringify({ volume: 50, repeat: "all" }))).toBeNull(); // index 없음
    expect(parsePlayerState(JSON.stringify({ index: 1.5, volume: 50, repeat: "all" }))).toBeNull(); // 정수 아님
    expect(parsePlayerState(JSON.stringify({ index: -1, volume: 50, repeat: "all" }))).toBeNull(); // 음수
    expect(parsePlayerState(JSON.stringify({ index: 0, volume: 50, repeat: "loop" }))).toBeNull(); // 잘못된 repeat
    expect(parsePlayerState(JSON.stringify({ index: 0, volume: 999, repeat: "all" }))).toBeNull(); // 볼륨 범위 밖
  });
  it("정상 값은 복원 (playing 제외)", () => {
    const p = parsePlayerState(JSON.stringify({ index: 3, volume: 20, repeat: "off" }));
    expect(p).toEqual({ index: 3, playing: false, volume: 20, repeat: "off" });
  });
});
