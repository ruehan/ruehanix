import { RuehanixShell } from "@/components/ruehanix/RuehanixShell";
import { getAllPosts } from "@/lib/posts/source";
import { getAllTracks } from "@/lib/tracks/source";
import { getAllPhotos } from "@/lib/photos/source";
import { getAllArtists } from "@/lib/artists/source";

// Sanity 글·곡·사진·아티스트를 서버에서 가져와 셸에 주입. 60초 ISR로 새 콘텐츠가 반영된다.
export const revalidate = 60;

export default async function Page() {
  const [posts, tracks, photos, artists] = await Promise.all([getAllPosts(), getAllTracks(), getAllPhotos(), getAllArtists()]);
  return <RuehanixShell posts={posts} tracks={tracks} photos={photos} artists={artists} />;
}
