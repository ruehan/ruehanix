import { getAllPosts } from "@/lib/posts/source";
import { buildRssXml } from "@/lib/posts/rss";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ruehan.dev";

export async function GET() {
  const posts = await getAllPosts();
  const xml = buildRssXml(posts, SITE_URL);
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
