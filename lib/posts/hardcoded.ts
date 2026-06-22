import { POSTS } from "@/lib/ruehanix/data";
import type { BlogPost } from "./types";

/** 글 id → URL 슬러그(영문, 수동). */
const SLUGS: Record<string, string> = {
  p1: "react-server-components-after-1-year",
  p2: "monorepo-build-time-cut-70-percent",
  p3: "iracing-nordschleife-sub-7",
  p4: "lemans-2026-hypercar",
  p5: "f1-2026-regulations",
  p6: "bass-six-months",
  p7: "daily-playlist-and-tone",
  p8: "typescript-narrowing-patterns",
};

function toIso(displayDate: string): string {
  return displayDate.replaceAll(".", "-") + "T00:00:00.000Z";
}

/** 셸(id 기반 POSTS)에서 글 라우트로 연결할 때 쓰는 id→슬러그 조회. */
export function slugForId(id: string): string {
  return SLUGS[id] ?? id;
}

const ALL: BlogPost[] = POSTS.map((p) => ({
  slug: SLUGS[p.id] ?? p.id,
  title: p.title,
  category: p.cat,
  publishedAt: toIso(p.date),
  date: p.date,
  excerpt: p.excerpt,
  readingTime: p.read,
  body: p.body,
})).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

export async function getAllPosts(): Promise<BlogPost[]> {
  return ALL;
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  return ALL.find((p) => p.slug === slug) ?? null;
}

export async function getSlugs(): Promise<string[]> {
  return ALL.map((p) => p.slug);
}
