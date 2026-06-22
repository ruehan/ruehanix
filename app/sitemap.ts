import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts/source";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ruehan.dev";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE_URL}/posts/${p.slug}`,
    lastModified: p.publishedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/posts`, changeFrequency: "weekly", priority: 0.8 },
    ...postEntries,
  ];
}
