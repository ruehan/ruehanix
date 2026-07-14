import { describe, it, expect } from "vitest";
import {
  parseLayoutSnapshot,
  serializeLayoutSnapshot,
  DEFAULT_LAYOUT_SNAPSHOT,
  LAYOUT_STORAGE_KEY,
} from "./layout-storage";

describe("layout-storage", () => {
  it("DEFAULT_LAYOUT_SNAPSHOT 는 version 1 + 빈 layout", () => {
    expect(DEFAULT_LAYOUT_SNAPSHOT.version).toBe(1);
    expect(DEFAULT_LAYOUT_SNAPSHOT.ws).toBe(1);
    expect(DEFAULT_LAYOUT_SNAPSHOT.open).toEqual({});
    expect(DEFAULT_LAYOUT_SNAPSHOT.order).toEqual([]);
    expect(DEFAULT_LAYOUT_SNAPSHOT.ratios).toEqual({});
    expect(DEFAULT_LAYOUT_SNAPSHOT.minimized).toEqual({});
    expect(DEFAULT_LAYOUT_SNAPSHOT.maximized).toBeNull();
  });

  it("serialize → parse 라운드트립이 정보를 보존한다", () => {
    const snap = {
      version: 1 as const,
      ws: 2,
      open: { files: { ws: 2 }, reader: { ws: 2 } },
      order: ["reader", "files"] as ("reader" | "files")[],
      ratios: { "ws2-0": 0.4, "ws2-1": 0.6 },
      minimized: { music: true },
      maximized: "reader" as const,
    };
    const raw = serializeLayoutSnapshot(snap);
    const parsed = parseLayoutSnapshot(raw);
    expect(parsed).toEqual(snap);
  });

  it("raw 가 null/빈 문자열이면 DEFAULT 반환", () => {
    expect(parseLayoutSnapshot(null)).toBe(DEFAULT_LAYOUT_SNAPSHOT);
    expect(parseLayoutSnapshot("")).toBe(DEFAULT_LAYOUT_SNAPSHOT);
    expect(parseLayoutSnapshot(undefined)).toBe(DEFAULT_LAYOUT_SNAPSHOT);
  });

  it("잘못된 JSON 이면 DEFAULT (방어)", () => {
    expect(parseLayoutSnapshot("not json {")).toBe(DEFAULT_LAYOUT_SNAPSHOT);
  });

  it("version 불일치 (예: 2) 면 DEFAULT 폴백 + parse 성공 가능 형태", () => {
    // 미래 스키마 — 현재는 v1 만 받음. v2 는 폴백.
    const future = JSON.stringify({
      version: 2,
      ws: 1,
      open: {},
      order: [],
      ratios: {},
      minimized: {},
      maximized: null,
      newField: "unknown",
    });
    expect(parseLayoutSnapshot(future)).toBe(DEFAULT_LAYOUT_SNAPSHOT);
  });

  it("필수 필드 누락 시 DEFAULT", () => {
    const partial = JSON.stringify({ version: 1, ws: 1 });
    expect(parseLayoutSnapshot(partial)).toBe(DEFAULT_LAYOUT_SNAPSHOT);
  });

  it("LAYOUT_STORAGE_KEY 는 'rh-layout'", () => {
    expect(LAYOUT_STORAGE_KEY).toBe("rh-layout");
  });

  it("ws 가 범위 밖(0, 7, NaN) 이면 DEFAULT.ws 로 폴백", () => {
    const raw = JSON.stringify({ version: 1, ws: 7, open: {}, order: [], ratios: {}, minimized: {}, maximized: null });
    expect(parseLayoutSnapshot(raw).ws).toBe(1);
    const raw2 = JSON.stringify({ version: 1, ws: 0, open: {}, order: [], ratios: {}, minimized: {}, maximized: null });
    expect(parseLayoutSnapshot(raw2).ws).toBe(1);
  });

  it("open 에 foreign key / 잘못된 ws 가 섞여도 유효한 항목만 살린다", () => {
    const raw = JSON.stringify({
      version: 1,
      ws: 1,
      open: { files: { ws: 1 }, bogus: { ws: 1 }, reader: { ws: 99 }, music: "x" },
      order: [],
      ratios: {},
      minimized: {},
      maximized: null,
    });
    const parsed = parseLayoutSnapshot(raw);
    expect(parsed.open).toEqual({ files: { ws: 1 } });
  });

  it("order 의 foreign 값은 무시", () => {
    const raw = JSON.stringify({
      version: 1,
      ws: 1,
      open: {},
      order: ["files", "evil", "reader"],
      ratios: {},
      minimized: {},
      maximized: null,
    });
    const parsed = parseLayoutSnapshot(raw);
    expect(parsed.order).toEqual(["files", "reader"]);
  });

  it("minimized 의 foreign key 와 non-bool 값은 무시", () => {
    const raw = JSON.stringify({
      version: 1,
      ws: 1,
      open: {},
      order: [],
      ratios: {},
      minimized: { files: true, bogus: true, reader: "yes" },
      maximized: null,
    });
    const parsed = parseLayoutSnapshot(raw);
    expect(parsed.minimized).toEqual({ files: true });
  });

  it("maximized 가 foreign 문자열이면 null", () => {
    const raw = JSON.stringify({
      version: 1, ws: 1, open: {}, order: [], ratios: {}, minimized: {},
      maximized: "evil",
    });
    expect(parseLayoutSnapshot(raw).maximized).toBeNull();
  });
});