import { client } from "@/lib/sanity/client";
import { normalizePhotos } from "./normalize";
import type { Photo } from "@/lib/ruehanix/types";
import type { SanityPhotoDoc } from "./types";

// image.asset-> 로 dereferenced Sanity asset document 를 통째로 투영.
// _id 가 urlFor 의 CDN URL 구성 키. 다른 필드(url, dimensions 등) 는 helper 가 필요시 접근.
const ALL_PHOTOS = `*[_type == "photo" && defined(image.asset)] | order(coalesce(order, 9999) asc, title asc){ "asset": image.asset->, title, tag, order, folder, description }`;

/** 사진 전체(순서대로). */
export async function getAllPhotos(): Promise<Photo[]> {
  const docs = await client.fetch<SanityPhotoDoc[]>(ALL_PHOTOS);
  return normalizePhotos(docs);
}
