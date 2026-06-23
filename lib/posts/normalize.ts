import type { PortableTextBlock } from "@portabletext/types";
import type { CatKey } from "@/lib/ruehanix/types";
import type { BlogPost, SanityPostDoc } from "./types";

const CATS: CatKey[] = ["dev", "sim", "moto", "music"];

/** ISO 날짜를 표시용 YYYY.MM.DD로. 빈 값/유효하지 않으면 빈 문자열.
 *  타임존 무관하게 UTC 기준으로 포맷한다(서버/클라 렌더 불일치·하루 어긋남 방지). */
export function formatDate(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

/** 본문 블록 정제: asset 없는 image 블록을 제외한다(urlFor가 throw하므로).
 *  tracks(videoId)·photos(url)의 "유효하지 않은 항목 제외"와 일관된 방어. */
function sanitizeBody(blocks: unknown): PortableTextBlock[] {
  if (!Array.isArray(blocks)) return [];
  return (blocks as PortableTextBlock[]).filter((b) => {
    const o = b as { _type?: string; asset?: unknown };
    return !(o?._type === "image" && !o.asset);
  });
}

/** Sanity 문서 → BlogPost. 누락 필드는 안전한 기본값으로 채운다. */
export function normalizePost(doc: SanityPostDoc): BlogPost {
  const category = (CATS as string[]).includes(doc.category ?? "") ? (doc.category as CatKey) : "dev";
  return {
    slug: doc.slug?.current ?? "",
    title: doc.title ?? "",
    category,
    publishedAt: doc.publishedAt ?? "",
    date: formatDate(doc.publishedAt),
    excerpt: doc.excerpt ?? "",
    readingTime: doc.readingTime ?? "",
    body: sanitizeBody(doc.body),
  };
}
