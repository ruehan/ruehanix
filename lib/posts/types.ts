import type { CatKey } from "@/lib/ruehanix/types";

/** Sanity 등 소스에서 정규화된 블로그 글. 소스가 바뀌어도 이 형태는 유지된다. */
export interface BlogPost {
  slug: string;
  title: string;
  category: CatKey;
  publishedAt: string; // ISO
  date: string; // 표시용 YYYY.MM.DD
  excerpt: string;
  readingTime: string;
  body: unknown[]; // Portable Text 블록
}

/** Sanity post 문서의 원형(필요한 필드만). */
export interface SanityPostDoc {
  slug?: { current?: string };
  title?: string;
  category?: string;
  publishedAt?: string;
  excerpt?: string;
  readingTime?: string;
  body?: unknown[];
}
