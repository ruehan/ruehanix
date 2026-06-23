import { RuehanixShell } from "@/components/ruehanix/RuehanixShell";
import { getAllPosts } from "@/lib/posts/source";
import { getAllTracks } from "@/lib/tracks/source";
import { getAllPhotos } from "@/lib/photos/source";

// Sanity 글·곡·사진을 서버에서 가져와 셸에 주입. 60초 ISR로 새 콘텐츠가 반영된다.
export const revalidate = 60;

export default async function Page() {
  const [posts, tracks, photos] = await Promise.all([getAllPosts(), getAllTracks(), getAllPhotos()]);
  return <RuehanixShell posts={posts} tracks={tracks} photos={photos} />;
}
