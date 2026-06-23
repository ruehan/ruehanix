import { describe, expect, it } from "vitest";
import { buildRssXml, escapeXml } from "./rss";
import type { BlogPost } from "./types";

describe("escapeXml", () => {
  it("XML 특수문자 이스케이프", () => {
    expect(escapeXml("a < b & c > d \"q\" 'r'")).toBe("a &lt; b &amp; c &gt; d &quot;q&quot; &apos;r&apos;");
  });
});

describe("buildRssXml", () => {
  const posts: BlogPost[] = [
    { slug: "first", title: "제목 & <태그>", category: "dev", publishedAt: "2026-06-18T00:00:00.000Z", date: "2026.06.18", excerpt: "요약", readingTime: "9분", body: [] },
  ];
  it("rss 2.0 구조 + item 링크/제목 이스케이프", () => {
    const xml = buildRssXml(posts, "https://ruehan.dev");
    expect(xml).toContain('<rss version="2.0">');
    expect(xml).toContain("<link>https://ruehan.dev/posts/first</link>");
    expect(xml).toContain("<title>제목 &amp; &lt;태그&gt;</title>");
    expect(xml).toContain("<pubDate>");
  });
  it("글 수만큼 item", () => {
    const xml = buildRssXml(posts, "https://ruehan.dev");
    expect(xml.match(/<item>/g)).toHaveLength(1);
  });
  it("발행일 빈 값/유효하지 않으면 pubDate 생략(Invalid Date 미출력)", () => {
    const xml = buildRssXml(
      [{ slug: "x", title: "t", category: "dev", publishedAt: "", date: "", excerpt: "e", readingTime: "", body: [] }],
      "https://ruehan.dev",
    );
    expect(xml).not.toContain("Invalid Date");
    expect(xml).not.toContain("<pubDate>");
  });
});
