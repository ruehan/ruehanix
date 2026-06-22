import { RuehanixShell } from "@/components/ruehanix/RuehanixShell";
import { getAllPosts } from "@/lib/posts/source";

// Sanity 글을 서버에서 가져와 셸에 주입. 60초 ISR로 새 글이 반영된다.
export const revalidate = 60;

export default async function Page() {
  const posts = await getAllPosts();
  return <RuehanixShell posts={posts} />;
}
