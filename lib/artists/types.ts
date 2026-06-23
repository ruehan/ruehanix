/** Sanity artist 문서/역참조 원형(GROQ에서 id는 _id, photoUrl은 photo.asset->url 투영). */
export interface SanityArtistDoc {
  id?: string;
  name?: string;
  photoUrl?: string;
  bio?: string;
  genre?: string;
  origin?: string;
  links?: { label?: string; url?: string }[];
}
