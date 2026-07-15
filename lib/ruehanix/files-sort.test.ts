import { describe, it, expect } from "vitest";
import { sortPosts, type SortKey, type SortablePost } from "./files-sort";

const P = (over: Partial<SortablePost>): SortablePost => ({
  id: over.id ?? "x",
  title: over.title ?? "x",
  excerpt: over.excerpt ?? "",
  date: over.date ?? "2026-01-01",
  catLabel: over.catLabel ?? "dev",
  catColor: over.catColor ?? "#fff",
  rowBg: over.rowBg ?? "transparent",
  open: () => {},
});

describe("sortPosts", () => {
  it("date desc 가 기본", () => {
    const out = sortPosts(
      [P({ id: "a", date: "2026-01-01" }), P({ id: "b", date: "2026-06-01" })],
      "date-desc",
    );
    expect(out.map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("date asc", () => {
    const out = sortPosts(
      [P({ id: "a", date: "2026-01-01" }), P({ id: "b", date: "2026-06-01" })],
      "date-asc",
    );
    expect(out.map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("title asc (한국어 로케일)", () => {
    const out = sortPosts(
      [P({ id: "a", title: "가나다" }), P({ id: "b", title: "나다라" }), P({ id: "c", title: "마바사" })],
      "title-asc",
    );
    expect(out.map((p) => p.id)).toEqual(["a", "b", "c"]);
  });

  it("title desc", () => {
    const out = sortPosts(
      [P({ id: "a", title: "가나다" }), P({ id: "b", title: "나다라" })],
      "title-desc",
    );
    expect(out.map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("title-asc 동점이면 date desc tie-breaker", () => {
    const out = sortPosts(
      [
        P({ id: "a", title: "같은", date: "2026-01-01" }),
        P({ id: "b", title: "같은", date: "2026-06-01" }),
      ],
      "title-asc",
    );
    expect(out.map((p) => p.id)).toEqual(["b", "a"]);
  });

  it("빈 배열 → 빈 배열", () => {
    expect(sortPosts([], "date-desc")).toEqual([]);
  });

  it("입력 배열 immutability — 원본 보존", () => {
    const arr = [P({ id: "a", date: "2026-01-01" }), P({ id: "b", date: "2026-06-01" })];
    const before = arr.map((p) => p.id);
    sortPosts(arr, "date-desc");
    expect(arr.map((p) => p.id)).toEqual(before);
  });
});