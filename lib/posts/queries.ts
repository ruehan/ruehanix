import { client } from "@/lib/sanity/client";
import { normalizePost } from "./normalize";
import type { BlogPost, SanityPostDoc } from "./types";

const POST_FIELDS = `slug, title, category, publishedAt, excerpt, readingTime, body`;

const ALL_POSTS = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc){ ${POST_FIELDS} }`;
const ONE_POST = `*[_type == "post" && slug.current == $slug][0]{ ${POST_FIELDS} }`;
const ALL_SLUGS = `*[_type == "post" && defined(slug.current)].slug.current`;

/** 발행 글 전체(최신순). */
export async function getAllPosts(): Promise<BlogPost[]> {
  const docs = await client.fetch<SanityPostDoc[]>(ALL_POSTS);
  return docs.map(normalizePost);
}

/** 슬러그로 글 하나. 없으면 null. */
export async function getPost(slug: string): Promise<BlogPost | null> {
  const doc = await client.fetch<SanityPostDoc | null>(ONE_POST, { slug });
  return doc ? normalizePost(doc) : null;
}

/** 정적 생성용 슬러그 목록. */
export async function getSlugs(): Promise<string[]> {
  return client.fetch<string[]>(ALL_SLUGS);
}
