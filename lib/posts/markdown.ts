import type { PortableTextBlock } from "@portabletext/types";
import { formatDate } from "./normalize";
import type { PostMeta } from "./frontmatter";
import type { BlogPost } from "./types";

/**
 * md body → Portable Text 블록. sync-posts.mjs 의 toPortableText 와 동일 규약.
 * 표 → codeBlock(text) 폴백 (스키마에 table 타입 없음).
 */
export function toPortableText(md: string): PortableTextBlock[] {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const blocks: PortableTextBlock[] = [];
  let i = 0;
  let n = 0;
  const key = () => `b${(n++).toString(36)}`;
  const block = (style: "h1" | "h2" | "h3" | "h4" | "blockquote" | "normal", text: string) => ({
    _type: "block" as const,
    _key: key(),
    style,
    children: [{ _type: "span" as const, _key: key() + "s", text, marks: [] }],
    markDefs: [],
  });
  // PortableTextBlock union 에 codeBlock 가 직접 포함되지 않으므로 any 캐스트.
  // 어차피 PostBody 가 _type: "codeBlock" 도 별도 처리하므로 안전.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const codeBlock = (language: string, code: string): any => ({
    _type: "codeBlock" as const,
    _key: key(),
    language,
    code,
  });

  while (i < lines.length) {
    const ln = lines[i];
    if (/^```/.test(ln)) {
      const language = ln.slice(3).trim() || "text";
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      if (i < lines.length) i++;
      blocks.push(codeBlock(language, buf.join("\n")));
      continue;
    }
    if (/^# /.test(ln)) { blocks.push(block("h1", ln.slice(2))); i++; continue; }
    if (/^## /.test(ln)) { blocks.push(block("h2", ln.slice(3))); i++; continue; }
    if (/^### /.test(ln)) { blocks.push(block("h3", ln.slice(4))); i++; continue; }
    if (/^#### /.test(ln)) { blocks.push(block("h4", ln.slice(5))); i++; continue; }
    if (/^> /.test(ln)) { blocks.push(block("blockquote", ln.slice(2))); i++; continue; }
    if (ln.trim() === "") { i++; continue; }
    if (/^\|/.test(ln)) {
      const buf: string[] = [];
      while (i < lines.length && /^\|/.test(lines[i])) buf.push(lines[i++]);
      blocks.push(codeBlock("text", buf.join("\n")));
      continue;
    }
    const buf = [ln];
    i++;
    while (i < lines.length && lines[i].trim() !== "" && !/^(#|##|###|####|>|```|\|)/.test(lines[i])) {
      buf.push(lines[i++]);
    }
    blocks.push(block("normal", buf.join(" ").trim()));
  }
  return blocks;
}

/**
 * meta (frontmatter 정규화) + body (md) → BlogPost.
 * published: false + publishedAt 없음 → publishedAt 키 자체 생략 (Sanity schema 회피).
 * publishedAt = ISO (정렬·메타). 표시용은 date 필드(YYYY.MM.DD).
 */
const VALID_CATEGORIES = new Set<BlogPost["category"]>(["dev", "sim", "moto", "music"]);

export function buildPost(meta: PostMeta, body: string): BlogPost {
  // "true" / "false" string 또는 undefined. !== "true" 가 unpublish 의 안전한 판정.
  const isUnpublished = meta.published !== undefined && meta.published !== "true";
  const hasDate = !!meta.publishedAt;
  // category 검증 — CATS 매핑 시 undefined.label 회피. 미지정/외부값은 "dev" 기본.
  const rawCat = meta.category;
  const category: BlogPost["category"] = rawCat && VALID_CATEGORIES.has(rawCat as BlogPost["category"])
    ? (rawCat as BlogPost["category"])
    : "dev";
  const post: BlogPost = {
    slug: meta.slug ?? "",
    title: meta.title ?? "",
    category,
    date: hasDate ? formatDate(meta.publishedAt!) : "",
    excerpt: meta.excerpt ?? "",
    readingTime: meta.readingTime ?? "",
    body: toPortableText(body),
  };
  if (hasDate) post.publishedAt = meta.publishedAt!;
  post.published = !isUnpublished;
  return post;
}
