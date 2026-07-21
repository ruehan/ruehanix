/** Sanity photo 문서의 원형(필요한 필드만). asset 은 GROQ `image.asset->` 의 dereferenced asset document. */
import type { PhotoAsset } from "@/lib/sanity/photo-url";

export interface SanityPhotoDoc {
  asset?: PhotoAsset;
  title?: string;
  tag?: string;
  order?: number;
  folder?: string;
  description?: string;
}
