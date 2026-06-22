import type { CatKey } from "@/lib/ruehanix/types";

/** 소스(하드코딩·Sanity 등)에서 정규화된 블로그 글. 소스가 바뀌어도 이 형태는 유지된다. */
export interface BlogPost {
  slug: string;
  title: string;
  category: CatKey;
  publishedAt: string; // ISO (정렬·메타·lastmod용)
  date: string; // 표시용 YYYY.MM.DD
  excerpt: string;
  readingTime: string;
  body: string[]; // 문단 텍스트 배열(소스 무관 통일 형식)
}

/** Sanity post 문서의 원형(필요한 필드만). body는 Portable Text 블록. */
export interface SanityPostDoc {
  slug?: { current?: string };
  title?: string;
  category?: string;
  publishedAt?: string;
  excerpt?: string;
  readingTime?: string;
  body?: unknown[];
}
