/** Sanity album 문서 원형(GROQ에서 id는 _id, coverUrl은 cover.asset->url, artistId는 artistRef->_id 투영). */
export interface SanityAlbumDoc {
  id?: string;
  title?: string;
  coverUrl?: string;
  year?: string;
  artistId?: string;
}
