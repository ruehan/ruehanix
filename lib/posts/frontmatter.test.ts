import { describe, it, expect } from "vitest";
import { parsePostFrontmatter } from "./frontmatter";

describe("parsePostFrontmatter", () => {
  it("frontmatter 키-값을 객체로 파싱한다", () => {
    const md = `---
title: Hello
slug: hello-world
category: dev
publishedAt: 2026-07-14
readingTime: 5분
excerpt: short description
---

# 본문`;
    const { meta, body } = parsePostFrontmatter(md);
    expect(meta.title).toBe("Hello");
    expect(meta.slug).toBe("hello-world");
    expect(meta.category).toBe("dev");
    expect(meta.publishedAt).toBe("2026-07-14");
    expect(meta.readingTime).toBe("5분");
    expect(meta.excerpt).toBe("short description");
    expect(body.startsWith("# 본문")).toBe(true);
  });

  it("frontmatter 가 없으면 빈 메타 + 전체를 본문으로 본다", () => {
    const md = `# 제목만\n본문`;
    const { meta, body } = parsePostFrontmatter(md);
    expect(meta).toEqual({});
    expect(body).toBe(md);
  });

  it("값에 콜론이 있어도 첫 줄의 첫 콜론까지만 분리한다", () => {
    const md = `---
title: Foo: Bar
slug: x
---
본문`;
    const { meta } = parsePostFrontmatter(md);
    expect(meta.title).toBe("Foo: Bar");
  });

  it("frontmatter 종료선(---)이 없으면 전체를 본문으로 본다", () => {
    const md = `title: 잘못된 형식\n본문`;
    const { meta, body } = parsePostFrontmatter(md);
    expect(meta).toEqual({});
    expect(body).toBe(md);
  });
});