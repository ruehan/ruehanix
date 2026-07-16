import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePostFrontmatter } from "./frontmatter";
import { buildPost } from "./markdown";
import type { BlogPost } from "./types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, "..", "..", "content", "posts");

/** md 파일 이름 → slug. ".md" 제거. */
function fileToSlug(file: string): string {
  return file.replace(/\.md$/, "");
}

function readPostFile(slug: string): { meta: ReturnType<typeof parsePostFrontmatter>["meta"]; body: string } | null {
  const file = join(POSTS_DIR, `${fileToSlug(slug)}.md`);
  try {
    const raw = readFileSync(file, "utf8");
    return parsePostFrontmatter(raw);
  } catch {
    return null;
  }
}

/** 모든 md 파일 (md 만). */
function listAllPostFiles(): string[] {
  try {
    return readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return [];
  }
}

/** frontmatter 의 published 가 "true"/"false" string 또는 undefined. unpublish 판정. */
function isUnpublished(p: unknown): boolean {
  return p === "false" || p === false;
}

/** 발행 글 전체(최신순). published: false / parse 실패 제외. */
export async function getAllPosts(): Promise<BlogPost[]> {
  const out: BlogPost[] = [];
  for (const f of listAllPostFiles()) {
    const slug = fileToSlug(f);
    const parsed = readPostFile(slug);
    if (!parsed) continue;
    if (isUnpublished(parsed.meta.published)) continue;
    out.push(buildPost(parsed.meta, parsed.body));
  }
  return out.sort((a, b) => {
    const aT = a.publishedAt ?? "";
    const bT = b.publishedAt ?? "";
    return aT < bT ? 1 : aT > bT ? -1 : 0;
  });
}

/** 슬러그로 글 하나. 없거나 unpublish 면 null. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  const parsed = readPostFile(slug);
  if (!parsed) return null;
  if (isUnpublished(parsed.meta.published)) return null;
  return buildPost(parsed.meta, parsed.body);
}

/** 정적 생성용 슬러그 목록. published: false 제외. */
export async function getSlugs(): Promise<string[]> {
  const out: string[] = [];
  for (const f of listAllPostFiles()) {
    const slug = fileToSlug(f);
    const parsed = readPostFile(slug);
    if (!parsed) continue;
    if (isUnpublished(parsed.meta.published)) continue;
    out.push(slug);
  }
  return out;
}