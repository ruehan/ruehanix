import { RuehanixShell } from "@/components/ruehanix/RuehanixShell";
import { getAllPosts } from "@/lib/posts/source";
import { getAllTracks } from "@/lib/tracks/source";
import { getAllPhotos } from "@/lib/photos/source";
import { getAllArtists } from "@/lib/artists/source";
import { getAllAlbums } from "@/lib/albums/source";

// Sanity 글·곡·사진·아티스트·앨범을 서버에서 가져와 셸에 주입. 캐시 완전 비활성 — 매 요청 fresh fetch (ADR 0058).
export const revalidate = 0;

export default async function Page() {
  const [posts, tracks, photos, artists, albums] = await Promise.all([getAllPosts(), getAllTracks(), getAllPhotos(), getAllArtists(), getAllAlbums()]);
  return <RuehanixShell posts={posts} tracks={tracks} photos={photos} artists={artists} albums={albums} />;
}
