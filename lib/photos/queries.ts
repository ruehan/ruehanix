import { client } from "@/lib/sanity/client";
import { normalizePhotos } from "./normalize";
import type { Photo } from "@/lib/ruehanix/types";
import type { SanityPhotoDoc } from "./types";

// order 오름차순(없으면 제목순). url은 asset 직접 투영.
const ALL_PHOTOS = `*[_type == "photo" && defined(image.asset)] | order(coalesce(order, 9999) asc, title asc){ "url": image.asset->url, title, tag, order }`;

/** 사진 전체(순서대로). */
export async function getAllPhotos(): Promise<Photo[]> {
  const docs = await client.fetch<SanityPhotoDoc[]>(ALL_PHOTOS);
  return normalizePhotos(docs);
}
