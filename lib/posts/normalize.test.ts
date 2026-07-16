import { describe, expect, it } from "vitest";
import { formatDate } from "./normalize";

describe("formatDate", () => {
  it("ISO → YYYY.MM.DD (UTC 고정)", () => {
    expect(formatDate("2026-06-18T09:00:00Z")).toBe("2026.06.18");
  });
  it("UTC 경계: 늦은 UTC 시각도 그 날짜 그대로(로컬 TZ에 흔들리지 않음)", () => {
    expect(formatDate("2026-06-18T23:30:00Z")).toBe("2026.06.18");
  });
  it("빈/유효하지 않은 값은 빈 문자열", () => {
    expect(formatDate(undefined)).toBe("");
    expect(formatDate("not-a-date")).toBe("");
  });
});
