import type { SanityArtistDoc } from "@/lib/artists/types";

/** Sanity track 문서의 원형(필요한 필드만). artistRef는 역참조된 artist 문서(공유 형태). */
export interface SanityTrackDoc {
  videoId?: string;
  title?: string;
  artist?: string;
  order?: number;
  artistRef?: SanityArtistDoc | null;
}
