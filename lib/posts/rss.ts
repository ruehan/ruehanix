import type { BlogPost } from "./types";

/** XML 특수문자 이스케이프. */
export function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      default:
        return "&quot;";
    }
  });
}

/** 글 목록 → RSS 2.0 XML. */
export function buildRssXml(posts: BlogPost[], site: string): string {
  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${site}/posts/${p.slug}</link>
      <guid>${site}/posts/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt)}</description>
    </item>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>ruehan.dev</title>
    <link>${site}</link>
    <description>한규(ruehan)의 기술 블로그</description>
    <language>ko</language>
${items}
  </channel>
</rss>`;
}
