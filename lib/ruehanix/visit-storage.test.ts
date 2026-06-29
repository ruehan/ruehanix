import { describe, expect, it } from "vitest";
import { MAX_VISITS, parseVisits, recordVisit, serializeVisits } from "./visit-storage";

describe("parseVisits", () => {
  it("직렬화 → 파싱 라운드트립", () => {
    expect(parseVisits(serializeVisits(["a", "b"]))).toEqual(["a", "b"]);
  });
  it("빈 값/잘못된 JSON/비문자열배열은 null", () => {
    expect(parseVisits(null)).toBeNull();
    expect(parseVisits("not json")).toBeNull();
    expect(parseVisits(JSON.stringify([1, 2]))).toBeNull();
  });
  it("빈 slug 제거 + 중복 제거(순서 유지)", () => {
    expect(parseVisits(JSON.stringify(["a", "", "a", "b"]))).toEqual(["a", "b"]);
  });
});

describe("recordVisit", () => {
  it("새 방문은 맨 앞에", () => {
    expect(recordVisit(["a"], "b")).toEqual(["b", "a"]);
  });
  it("재방문은 맨 앞으로 이동(LRU)", () => {
    expect(recordVisit(["a", "b", "c"], "b")).toEqual(["b", "a", "c"]);
  });
  it("최대 개수 초과 시 가장 오래된 것(끝) 버림", () => {
    const list = Array.from({ length: MAX_VISITS }, (_, i) => `s${i}`); // s0..s{N-1}, s0 최신
    const next = recordVisit(list, "new");
    expect(next[0]).toBe("new");
    expect(next).toHaveLength(MAX_VISITS);
    expect(next).not.toContain(`s${MAX_VISITS - 1}`); // 가장 오래된 끝 항목 제거
  });
});

describe("DEFAULT 한계", () => {
  it("MAX_VISITS 는 양수", () => {
    expect(MAX_VISITS).toBeGreaterThan(0);
  });
});
