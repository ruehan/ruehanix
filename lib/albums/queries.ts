import { client } from "@/lib/sanity/client";
import { normalizeAlbums } from "./normalize";
import type { Album } from "@/lib/ruehanix/types";
import type { SanityAlbumDoc } from "./types";

const ALBUM_FIELDS = `"id": _id, title, "coverUrl": cover.asset->url, year, "artistId": artistRef->_id`;
const ALL_ALBUMS = `*[_type == "album" && defined(title) && defined(artistRef)] | order(year asc, title asc){ ${ALBUM_FIELDS} }`;

/** 앨범 전체(연도·제목순). */
export async function getAllAlbums(): Promise<Album[]> {
  const docs = await client.fetch<SanityAlbumDoc[]>(ALL_ALBUMS);
  return normalizeAlbums(docs);
}
