import type { PortableTextBlock } from "@portabletext/types";
import { formatDate } from "./normalize";
import { parsePostFrontmatter, type PostMeta } from "./frontmatter";
import type { BlogPost } from "./types";
import { markdownToPortableText as mdToPt } from "@portabletext/markdown";

/**
 * md → 우리 스키마의 Portable Text.
 * @portabletext/markdown (Sanity 공식) 사용. post-process 로 우리 스키마에 맞춤.
 *  - code → codeBlock (rename, language·code 보존)
 *  - horizontal-rule → block style "hr" (PostBody 의 block renderer)
 *  - table: 미처리 (행 단위 풀어짐) — 차기 과제
 */
export function toPortableText(md: string): PortableTextBlock[] {
  const raw = mdToPt(md) as unknown as PortableTextBlock[];
  return raw.map((b) => {
    const bb = b as unknown as { _type?: string; _key?: string; language?: string; code?: string; [k: string]: unknown };
    if (bb._type === "code") {
      const r = { _type: "codeBlock" as unknown as PortableTextBlock["_type"], _key: bb._key, language: bb.language ?? "text", code: bb.code ?? "" };
      return r as unknown as PortableTextBlock;
    }
    if (bb._type === "horizontal-rule") {
      const r = { _type: "block" as unknown as PortableTextBlock["_type"], _key: bb._key, style: "hr", children: [], markDefs: [] };
      return r as unknown as PortableTextBlock;
    }
    return b;
  });
}

const VALID_CATEGORIES = new Set<BlogPost["category"]>(["dev", "sim", "moto", "music", "blog"]);

export function buildPost(meta: PostMeta, body: string): BlogPost {
  // "false" string 또는 false boolean 만 unpublish. 누락 / "true" / true → publish.
  const isUnpublished = meta.published === "false" || meta.published === (false as unknown);
  const hasDate = !!meta.publishedAt;
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
