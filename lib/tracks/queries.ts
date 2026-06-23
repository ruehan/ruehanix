import { client } from "@/lib/sanity/client";
import { normalizeTracks } from "./normalize";
import type { Track } from "@/lib/ruehanix/types";
import type { SanityTrackDoc } from "./types";

const TRACK_FIELDS = `videoId, title, artist, order`;
// order 오름차순(없으면 9999로 밀어 제목순), 동순위는 제목순.
const ALL_TRACKS = `*[_type == "track" && defined(videoId)] | order(coalesce(order, 9999) asc, title asc){ ${TRACK_FIELDS} }`;

/** 플레이리스트 전체(순서대로). */
export async function getAllTracks(): Promise<Track[]> {
  const docs = await client.fetch<SanityTrackDoc[]>(ALL_TRACKS);
  return normalizeTracks(docs);
}
