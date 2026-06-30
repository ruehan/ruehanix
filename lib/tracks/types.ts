import type { SanityArtistDoc } from "@/lib/artists/types";

/** Sanity track 문서의 원형(필요한 필드만). artistRef는 역참조된 artist 문서(공유 형태).
 *  albumRef는 앨범 참조로, _id만 투영한다(정규화는 albumId로). */
export interface SanityTrackDoc {
  videoId?: string;
  title?: string;
  artist?: string;
  order?: number;
  artistRef?: SanityArtistDoc | null;
  albumRef?: { _id?: string } | null;
}
