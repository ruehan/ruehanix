import { describe, expect, it } from "vitest";
import { DEFAULT_READER_PREFS, parseReaderPrefs, serializeReaderPrefs } from "./reader-storage";
import type { ReaderPrefs } from "./reader-storage";

const valid: ReaderPrefs = { fontSize: 17, width: 720 };

describe("parseReaderPrefs", () => {
  it("직렬화 → 파싱 라운드트립", () => {
    expect(parseReaderPrefs(serializeReaderPrefs(valid))).toEqual(valid);
  });
  it("빈 값/잘못된 JSON은 null", () => {
    expect(parseReaderPrefs(null)).toBeNull();
    expect(parseReaderPrefs("")).toBeNull();
    expect(parseReaderPrefs("{not")).toBeNull();
  });
  it("필수 필드 누락/범위 밖이면 null (기본값 사용 신호)", () => {
    expect(parseReaderPrefs(JSON.stringify({ fontSize: 17 }))).toBeNull(); // width 없음
    expect(parseReaderPrefs(JSON.stringify({ fontSize: 99, width: 720 }))).toBeNull(); // 폰트 범위 밖
    expect(parseReaderPrefs(JSON.stringify({ fontSize: 17, width: 2000 }))).toBeNull(); // 폭 범위 밖
  });
  it("값은 정수로 반올림", () => {
    const p = parseReaderPrefs(JSON.stringify({ fontSize: 16.7, width: 719.4 }));
    expect(p).toEqual({ fontSize: 17, width: 719 });
  });
});

describe("DEFAULT_READER_PREFS", () => {
  it("직렬화 → 파싱 라운드트립 (기본값도 저장 가능)", () => {
    expect(parseReaderPrefs(serializeReaderPrefs(DEFAULT_READER_PREFS))).toEqual(DEFAULT_READER_PREFS);
  });
  it("기본 폰트/폭은 허용 범위 내", () => {
    expect(DEFAULT_READER_PREFS.fontSize).toBeGreaterThanOrEqual(13);
    expect(DEFAULT_READER_PREFS.fontSize).toBeLessThanOrEqual(22);
    expect(DEFAULT_READER_PREFS.width).toBeGreaterThanOrEqual(560);
    expect(DEFAULT_READER_PREFS.width).toBeLessThanOrEqual(960);
  });
});
