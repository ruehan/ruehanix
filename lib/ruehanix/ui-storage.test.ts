import { describe, expect, it } from "vitest";
import { parseUiState, serializeUiState } from "./ui-storage";
import type { UiState } from "./types";

const valid: UiState = { mode: "light", accent: "#89b4fa", gap: 14, rounded: false, glow: true, transp: true };

describe("parseUiState", () => {
  it("직렬화 → 파싱 라운드트립", () => {
    expect(parseUiState(serializeUiState(valid))).toEqual(valid);
  });
  it("빈 값/잘못된 JSON은 null", () => {
    expect(parseUiState(null)).toBeNull();
    expect(parseUiState("")).toBeNull();
    expect(parseUiState("{not json")).toBeNull();
  });
  it("필수 필드 누락/형식 오류면 null", () => {
    expect(parseUiState(JSON.stringify({ accent: "#89b4fa", gap: 10 }))).toBeNull(); // mode 없음
    expect(parseUiState(JSON.stringify({ mode: "neon", accent: "#89b4fa", gap: 10 }))).toBeNull(); // 잘못된 mode
    expect(parseUiState(JSON.stringify({ mode: "dark", accent: "blue", gap: 10 }))).toBeNull(); // accent hex 아님
    expect(parseUiState(JSON.stringify({ mode: "dark", accent: "#89b4fa", gap: 99 }))).toBeNull(); // gap 범위 밖
  });
  it("선택 boolean 누락 시 안전 기본값", () => {
    const p = parseUiState(JSON.stringify({ mode: "dark", accent: "#cba6f7", gap: 10 }));
    expect(p).toEqual({ mode: "dark", accent: "#cba6f7", gap: 10, rounded: true, glow: true, transp: false });
  });
  it("gap은 정수로 반올림", () => {
    expect(parseUiState(JSON.stringify({ mode: "auto", accent: "#a6e3a1", gap: 12.7 }))?.gap).toBe(13);
  });
});
