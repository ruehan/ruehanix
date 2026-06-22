import { describe, expect, it } from "vitest";
import { filterApps } from "./search";

const apps = [
  { key: "files", name: "Files", hint: "파일 탐색" },
  { key: "terminal", name: "Terminal", hint: "셸" },
  { key: "web", name: "Web", hint: "ruehan.dev" },
];

describe("filterApps", () => {
  it("빈 질의는 전체 반환", () => {
    expect(filterApps(apps, "")).toHaveLength(3);
    expect(filterApps(apps, "   ")).toHaveLength(3);
  });
  it("이름 부분일치(대소문자 무시)", () => {
    expect(filterApps(apps, "ter").map((a) => a.key)).toEqual(["terminal"]);
    expect(filterApps(apps, "FILE").map((a) => a.key)).toEqual(["files"]);
  });
  it("힌트로도 매칭", () => {
    expect(filterApps(apps, "파일").map((a) => a.key)).toEqual(["files"]);
    expect(filterApps(apps, "dev").map((a) => a.key)).toEqual(["web"]);
  });
  it("키로도 매칭", () => {
    expect(filterApps(apps, "web").map((a) => a.key)).toEqual(["web"]);
  });
  it("매칭 없으면 빈 배열", () => {
    expect(filterApps(apps, "zzz")).toHaveLength(0);
  });
});
