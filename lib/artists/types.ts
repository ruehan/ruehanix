/** Sanity artist 문서/역참조 원형(GROQ 에서 id는 _id, photoAsset은 photo.asset-> 의 dereferenced asset document). */
import type { PhotoAsset } from "@/lib/sanity/photo-url";

export interface SanityArtistDoc {
  id?: string;
  name?: string;
  photoAsset?: PhotoAsset;
  bio?: string;
  genre?: string;
  origin?: string;
  links?: { label?: string; url?: string }[];
  members?: { name?: string; role?: string; photoAsset?: PhotoAsset }[];
}
