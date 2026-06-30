import { RuehanixShell } from "@/components/ruehanix/RuehanixShell";
import { getAllPosts } from "@/lib/posts/source";
import { getAllTracks } from "@/lib/tracks/source";
import { getAllPhotos } from "@/lib/photos/source";
import { getAllArtists } from "@/lib/artists/source";
import { getAllAlbums } from "@/lib/albums/source";

// Sanity 글·곡·사진·아티스트·앨범을 서버에서 가져와 셸에 주입. 60초 ISR로 새 콘텐츠가 반영된다.
export const revalidate = 60;

export default async function Page() {
  const [posts, tracks, photos, artists, albums] = await Promise.all([getAllPosts(), getAllTracks(), getAllPhotos(), getAllArtists(), getAllAlbums()]);
  return <RuehanixShell posts={posts} tracks={tracks} photos={photos} artists={artists} albums={albums} />;
}
