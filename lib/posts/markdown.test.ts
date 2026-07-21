import { describe, it, expect } from "vitest";
import { toPortableText, buildPost } from "./markdown";
import type { BlogPost } from "./types";
import type { PostMeta } from "./frontmatter";

describe("toPortableText (markdown-to-portable-text)", () => {
  it("##/### 헤딩", () => {
    expect(toPortableText("## h2")[0]).toMatchObject({ _type: "block", style: "h2" });
    expect(toPortableText("### h3")[0]).toMatchObject({ _type: "block", style: "h3" });
  });
  it("> 인용 → blockquote", () => {
    expect(toPortableText("> 인용")[0]).toMatchObject({ _type: "block", style: "blockquote" });
  });
  it("``` 코드 → codeBlock (rename)", () => {
    const out = toPortableText("```ts\nlet x = 1;\n```");
    const first = out[0] as unknown as { _type: string; language: string; code: string };
    expect(first._type).toBe("codeBlock");
    expect(first.language).toBe("ts");
    expect(first.code).toContain("let x = 1;");
  });
  it("--- hr → block style:hr (PostBody 처리)", () => {
    const out = toPortableText("text\n\n---\n\nmore");
    const hr = out.find((b) => (b as { style?: string }).style === "hr");
    expect(hr).toBeDefined();
    expect(hr?._type).toBe("block");
  });
  it("빈 md → 빈 배열", () => {
    expect(toPortableText("")).toEqual([]);
  });
  it("일반 텍스트 → block normal", () => {
    const out = toPortableText("그냥 본문");
    const first = out[0] as { _type?: string; children?: Array<{ text?: string }> };
    expect(first._type).toBe("block");
    expect(first.children?.[0]?.text).toBe("그냥 본문");
  });
  it("image ![alt](url) → image 블록 (md-to-portable-text 매핑)", () => {
    const out = toPortableText("![alt text](https://x/i.png)");
    const img = out[0] as unknown as { _type: string; src?: string; alt?: string };
    expect(img._type).toBe("image");
    expect(img.src).toBe("https://x/i.png");
    expect(img.alt).toBe("alt text");
  });
  it("table: 1행 헤더 + 데이터행 → _type:'table' 단일 블록", () => {
    const md = "| a | b |\n|---|---|\n| 1 | 2 |\n| 3 | 4 |";
    const out = toPortableText(md);
    const table = out[0] as unknown as {
      _type: string;
      headerRows: number;
      rows: Array<{ cells: Array<{ value: unknown[] }> }>;
    };
    expect(table._type).toBe("table");
    expect(table.headerRows).toBe(1);
    expect(table.rows.length).toBe(3);
    expect((table.rows[0].cells[0].value[0] as { children: Array<{ text: string }> }).children[0].text).toBe("a");
    expect((table.rows[1].cells[1].value[0] as { children: Array<{ text: string }> }).children[0].text).toBe("2");
  });
  it("table: 셀 안 **bold** → marks 'strong' 보존", () => {
    const md = "| x |\n|---|\n| **bold** |";
    const out = toPortableText(md);
    const table = out[0] as unknown as { rows: Array<{ cells: Array<{ value: Array<{ children: Array<{ text: string; marks: string[] }> }> }> }> };
    const cell = table.rows[1].cells[0];
    expect(cell.value[0].children[0].text).toBe("bold");
    expect(cell.value[0].children[0].marks).toContain("strong");
  });
  it("table: 직전/직후 단락은 분리되어 보존", () => {
    const md = "intro paragraph.\n\n| a | b |\n|---|---|\n| 1 | 2 |\n\noutro paragraph.";
    const out = toPortableText(md);
    expect(out.length).toBe(3);
    expect((out[0] as { _type?: string })._type).toBe("block");
    expect((out[1] as { _type?: string })._type).toBe("table");
    expect((out[2] as { _type?: string })._type).toBe("block");
    const intro = out[0] as { children: Array<{ text: string }> };
    expect(intro.children[0].text).toBe("intro paragraph.");
    const outro = out[2] as { children: Array<{ text: string }> };
    expect(outro.children[0].text).toBe("outro paragraph.");
  });
  it("table 없는 본문은 영향 없음 (회귀)", () => {
    const out = toPortableText("plain text\n\n## h2");
    expect(out.length).toBe(2);
    expect((out[0] as { _type?: string })._type).toBe("block");
    expect((out[1] as { style?: string }).style).toBe("h2");
  });
});

describe("buildPost", () => {
  const meta: PostMeta = {
    title: "제목", slug: "slug", category: "blog", publishedAt: "2026-07-15",
    readingTime: "5분", excerpt: "요약",
  };
  it("published: true (default)", () => {
    const out = buildPost(meta, "본문");
    expect(out.published).toBe(true);
  });
  it("published: false + publishedAt 없음 → 둘 다 미포함", () => {
    const m = { ...meta, published: "false" as const };
    delete m.publishedAt;
    const out = buildPost(m, "본문");
    expect(out.published).toBe(false);
    expect("publishedAt" in out).toBe(false);
  });
  it("category: 'blog' 매핑 — 화이트리스트 보존", () => {
    const out = buildPost({ ...meta, category: "blog" }, "본문");
    expect(out.category).toBe("blog");
  });
  it("category: 'unknown' → 'dev' fallback", () => {
    const out = buildPost({ ...meta, category: "unknown" as PostMeta["category"] }, "본문");
    expect(out.category).toBe("dev");
  });
});
