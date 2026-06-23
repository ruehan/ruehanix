import { RuehanixShell } from "@/components/ruehanix/RuehanixShell";
import { getAllPosts } from "@/lib/posts/source";
import { getAllTracks } from "@/lib/tracks/source";

// Sanity 글·곡을 서버에서 가져와 셸에 주입. 60초 ISR로 새 글·곡이 반영된다.
export const revalidate = 60;

export default async function Page() {
  const [posts, tracks] = await Promise.all([getAllPosts(), getAllTracks()]);
  return <RuehanixShell posts={posts} tracks={tracks} />;
}
