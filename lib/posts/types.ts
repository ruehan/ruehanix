import type { PortableTextBlock } from "@portabletext/types";
import type { CatKey } from "@/lib/ruehanix/types";

/** 소스(하드코딩·md/Sanity 등)에서 정규화된 블로그 글. 소스가 바뀌어도 이 형태는 유지된다. */
export interface BlogPost {
  slug: string;
  title: string;
  category: CatKey;
  /** ISO (정렬·메타·lastmod용). unpublish + publishedAt 없음 시 키 자체 생략. */
  publishedAt?: string;
  /** 표시용 YYYY.MM.DD. */
  date: string;
  /** default true. false 면 사이트 목록 제외 + 직접 URL 404. */
  published?: boolean;
  excerpt: string;
  readingTime: string;
  /** Portable Text 블록. 우리 스키마는 block + codeBlock + image (PostBody 가 처리). */
  body: PortableTextBlock[];
}
