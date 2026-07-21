import { client } from "@/lib/sanity/client";
import { normalizeArtists } from "./normalize";
import type { ArtistInfo } from "@/lib/ruehanix/types";
import type { SanityArtistDoc } from "./types";

// photoAsset / members[].photoAsset — GROQ `photo.asset->` 의 dereferenced asset document.
// _id 가 photoAvatarSrc 가 CDN URL 을 만드는 데 쓰인다.
const ARTIST_FIELDS = `"id": _id, name, "photoAsset": photo.asset->, bio, genre, origin, links[]{ label, url }, members[]{ name, role, "photoAsset": photo.asset-> }`;
const ALL_ARTISTS = `*[_type == "artist"] | order(name asc){ ${ARTIST_FIELDS} }`;

/** 아티스트 전체(이름순). */
export async function getAllArtists(): Promise<ArtistInfo[]> {
  const docs = await client.fetch<SanityArtistDoc[]>(ALL_ARTISTS);
  return normalizeArtists(docs);
}
