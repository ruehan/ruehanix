/** track.artistRef 역참조 원형(GROQ에서 photoUrl은 photo.asset->url 투영). */
export interface SanityArtistRef {
  name?: string;
  photoUrl?: string;
  bio?: string;
  genre?: string;
  origin?: string;
  links?: { label?: string; url?: string }[];
}

/** Sanity track 문서의 원형(필요한 필드만). */
export interface SanityTrackDoc {
  videoId?: string;
  title?: string;
  artist?: string;
  order?: number;
  artistRef?: SanityArtistRef | null;
}
