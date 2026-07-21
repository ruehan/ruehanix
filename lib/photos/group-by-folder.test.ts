import { describe, it, expect } from "vitest";
import { groupByFolder, UNCATEGORIZED } from "./group-by-folder";
import type { Photo } from "@/lib/ruehanix/types";

const P = (over: Partial<Photo>): Photo => ({
  asset: { _id: "image-x-100x100-jpg" },
  title: "t",
  tag: "",
  ...over,
});

describe("groupByFolder", () => {
  it("folder 별로 모은다 (사전순: moto < track)", () => {
    const out = groupByFolder([
      P({ title: "a", folder: "track" }),
      P({ title: "b", folder: "moto" }),
      P({ title: "c", folder: "track" }),
    ]);
    expect(out.map((g) => g.name)).toEqual(["moto", "track"]);
    expect(out[0].photos.map((p) => p.title)).toEqual(["b"]);
    expect(out[1].photos.map((p) => p.title)).toEqual(["a", "c"]);
  });

  it("folder 가 없거나 빈 문자열이면 UNCATEGORIZED 로 모음", () => {
    const out = groupByFolder([
      P({ title: "a" }),
      P({ title: "b", folder: "" }),
      P({ title: "c", folder: "track" }),
    ]);
    expect(out.find((g) => g.name === UNCATEGORIZED)?.photos.map((p) => p.title)).toEqual(["a", "b"]);
  });

  it("UNCATEGORIZED 는 항상 마지막에 위치", () => {
    const out = groupByFolder([
      P({ title: "z", folder: "zeta" }),
      P({ title: "a", folder: "alpha" }),
      P({ title: "n" }),
    ]);
    expect(out.map((g) => g.name)).toEqual(["alpha", "zeta", UNCATEGORIZED]);
  });

  it("빈 입력은 빈 배열", () => {
    expect(groupByFolder([])).toEqual([]);
  });

  it("각 그룹의 photos 순서는 입력 순서 유지", () => {
    const out = groupByFolder([
      P({ title: "1", folder: "x" }),
      P({ title: "2", folder: "y" }),
      P({ title: "3", folder: "x" }),
    ]);
    const xg = out.find((g) => g.name === "x")!;
    expect(xg.photos.map((p) => p.title)).toEqual(["1", "3"]);
  });
});
