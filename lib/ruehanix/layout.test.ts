import { describe, expect, it } from "vitest";
import { area, computeLayout } from "./layout";
import type { AppKey } from "./types";

const VP = { W: 1000, H: 800 };

describe("area", () => {
  it("waybar(50px)와 갭 마진을 제외한 영역", () => {
    const a = area(VP, 10);
    expect(a.x).toBe(12); // max(6, 10+2)
    expect(a.y).toBe(50); // 8+34+8
    expect(a.w).toBe(1000 - 24);
    expect(a.h).toBe(800 - 50 - 12);
  });
  it("갭이 작으면 최소 마진 6 적용", () => {
    expect(area(VP, 0).x).toBe(6);
  });
});

describe("computeLayout", () => {
  const full = { x: 0, y: 0, w: 1000, h: 800 };

  it("창이 없으면 빈 결과", () => {
    const r = computeLayout([], full, {}, 1, 10);
    expect(Object.keys(r.rects)).toHaveLength(0);
    expect(r.gutters).toHaveLength(0);
  });

  it("창 1개는 전체 영역을 차지하고 거터 없음", () => {
    const r = computeLayout(["files"], full, {}, 1, 10);
    expect(r.rects.files).toEqual(full);
    expect(r.gutters).toHaveLength(0);
  });

  it("창 2개는 세로 분할(좌우) + 거터 1개", () => {
    const ids: AppKey[] = ["files", "reader"];
    const r = computeLayout(ids, full, {}, 1, 10);
    // 기본 비율 0.5, gap 10 → 왼쪽 폭 500-5
    expect(r.rects.files).toEqual({ x: 0, y: 0, w: 495, h: 800 });
    expect(r.rects.reader).toEqual({ x: 505, y: 0, w: 495, h: 800 });
    expect(r.gutters).toHaveLength(1);
    expect(r.gutters[0].dir).toBe("v");
    expect(r.gutters[0].key).toBe("1:0");
  });

  it("창 3개는 분할 방향이 v→h로 번갈아", () => {
    const ids: AppKey[] = ["files", "reader", "foto"];
    const r = computeLayout(ids, full, {}, 1, 10);
    expect(r.gutters).toHaveLength(2);
    expect(r.gutters[0].dir).toBe("v");
    expect(r.gutters[1].dir).toBe("h");
    // 마지막 창은 남은 영역 채움
    expect(r.rects.foto).toBeDefined();
  });

  it("ratios로 분할 비율을 조정", () => {
    const ids: AppKey[] = ["files", "reader"];
    const r = computeLayout(ids, full, { "1:0": 0.7 }, 1, 10);
    expect(r.rects.files!.w).toBe(700 - 5);
    expect(r.rects.reader!.x).toBe(705);
  });
});
