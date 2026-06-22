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
    body: Array.isArray(doc.body) ? doc.body : [],
  };
}
