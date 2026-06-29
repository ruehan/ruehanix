import { describe, expect, it } from "vitest";
import { filterApps, searchAll } from "./search";

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

describe("searchAll", () => {
  const input = {
    apps,
    posts: [
      { slug: "a", title: "Next.js 서버 컴포넌트", excerpt: "RSC와 데이터 패칭" },
      { slug: "b", title: "모노레포 구축", excerpt: "turborepo 설정" },
    ],
    artists: [{ id: "x1", name: "Radiohead" }, { id: "x2", name: "Tool" }],
    photos: [{ id: "p1", title: "부산 야경" }],
  };

  it("빈 질의는 앱만 전체 반환(기존 런처 브라우징 동작 유지), 나머지는 빈 배열", () => {
    const r = searchAll(input, "   ");
    expect(r.apps).toHaveLength(3);
    expect(r.posts).toEqual([]);
    expect(r.artists).toEqual([]);
    expect(r.photos).toEqual([]);
  });

  it("'next' → 글 제목 매칭", () => {
    expect(searchAll(input, "next").posts.map((p) => p.slug)).toEqual(["a"]);
  });

  it("'turborepo' → 글 발췌 매칭", () => {
    expect(searchAll(input, "turborepo").posts.map((p) => p.slug)).toEqual(["b"]);
  });

  it("'tool' → 아티스트 이름 매칭(대소문자 무시)", () => {
    expect(searchAll(input, "tool").artists.map((a) => a.id)).toEqual(["x2"]);
  });

  it("'야경' → 사진 제목 매칭", () => {
    expect(searchAll(input, "야경").photos.map((p) => p.id)).toEqual(["p1"]);
  });

  it("앱은 이름/힌트/키로 매칭(filterApps와 동일)", () => {
    expect(searchAll(input, "ter").apps.map((a) => a.key)).toEqual(["terminal"]);
  });

  it("여러 도메인 동시 매칭", () => {
    const both = searchAll({ ...input, posts: [...input.posts, { slug: "c", title: "Terminal 도구", excerpt: "" }] }, "ter");
    expect(both.apps.map((a) => a.key)).toContain("terminal");
    expect(both.posts.map((p) => p.slug)).toContain("c");
  });
});
