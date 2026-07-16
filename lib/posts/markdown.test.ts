import { describe, it, expect } from "vitest";
import { toPortableText, buildPost } from "./markdown";
import type { BlogPost } from "./types";
import type { PostMeta } from "./frontmatter";

describe("toPortableText", () => {
  it("# 제목 → block h1", () => {
    const out = toPortableText("# 제목\n본문");
    expect(out[0]).toMatchObject({ _type: "block", style: "h1" });
  });

  it("##/### 헤딩", () => {
    expect(toPortableText("## h2")[0]).toMatchObject({ style: "h2" });
    expect(toPortableText("### h3")[0]).toMatchObject({ style: "h3" });
  });

  it("> 인용 → blockquote", () => {
    expect(toPortableText("> 인용")[0]).toMatchObject({ style: "blockquote" });
  });

  it("``` 코드 → codeBlock", () => {
    const out = toPortableText("```ts\nlet x = 1;\n```");
    const first = out[0] as unknown as { _type: string; language: string; code: string };
    expect(first).toMatchObject({ _type: "codeBlock", language: "ts" });
    expect(first.code).toContain("let x = 1;");
  });

  it("| 표 → codeBlock(text) 폴백", () => {
    const out = toPortableText("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(out[0]).toMatchObject({ _type: "codeBlock", language: "text" });
  });

  it("빈 md → 빈 배열", () => {
    expect(toPortableText("")).toEqual([]);
  });

  it("일반 텍스트 → block normal", () => {
    const out = toPortableText("그냥 본문");
    expect(out[0]).toMatchObject({ _type: "block", style: "normal" });
  });
});

describe("buildPost", () => {
  const meta: PostMeta = {
    title: "제목",
    slug: "slug",
    category: "dev",
    publishedAt: "2026-07-15",
    readingTime: "5분",
    excerpt: "요약",
  };

  it("published: true (default) → publishedAt ISO 포함 + date 표시", () => {
    const out = buildPost(meta, "");
    expect(out.published).toBe(true);
    expect(out.publishedAt).toBe("2026-07-15");
    expect(out.date).toBe("2026.07.15");
    expect(out.body).toEqual([]);
  });

  it("published: false + publishedAt 있음 → 둘 다 포함 (의미상 무시)", () => {
    const out = buildPost({ ...meta, published: "false" }, "");
    expect(out.published).toBe(false);
    expect(out.publishedAt).toBe("2026-07-15");
  });

  it("published: false + publishedAt 없음 → publishedAt 미포함", () => {
    const m = { ...meta, published: "false" };
    delete (m as Partial<typeof m>).publishedAt;
    const out = buildPost(m, "");
    expect(out.published).toBe(false);
    expect("publishedAt" in out).toBe(false);
  });

  it("slug·title·category·excerpt·readingTime 매핑", () => {
    const out = buildPost(meta, "");
    expect(out.slug).toBe("slug");
    expect(out.title).toBe("제목");
    expect(out.category).toBe("dev");
    expect(out.excerpt).toBe("요약");
    expect(out.readingTime).toBe("5분");
  });
  it("category: 'blog' 매핑 — 화이트리스트 보존", () => {
    const out = buildPost({ ...meta, category: "blog" }, "");
    expect(out.category).toBe("blog");
  });

  it("category: 'unknown' → 'dev' fallback", () => {
    const out = buildPost({ ...meta, category: "unknown" }, "");
    expect(out.category).toBe("dev");
  });

});
