/** Sanity photo 문서의 원형(필요한 필드만). url은 GROQ에서 image.asset->url로 투영. */
export interface SanityPhotoDoc {
  url?: string;
  title?: string;
  tag?: string;
  order?: number;
}
