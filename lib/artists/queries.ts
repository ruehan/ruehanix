import { client } from "@/lib/sanity/client";
import { normalizeArtists } from "./normalize";
import type { ArtistInfo } from "@/lib/ruehanix/types";
import type { SanityArtistDoc } from "./types";

const ARTIST_FIELDS = `"id": _id, name, "photoUrl": photo.asset->url, bio, genre, origin, links[]{ label, url }`;
const ALL_ARTISTS = `*[_type == "artist"] | order(name asc){ ${ARTIST_FIELDS} }`;

/** 아티스트 전체(이름순). */
export async function getAllArtists(): Promise<ArtistInfo[]> {
  const docs = await client.fetch<SanityArtistDoc[]>(ALL_ARTISTS);
  return normalizeArtists(docs);
}
