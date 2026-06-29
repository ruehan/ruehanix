export interface SearchableApp {
  key: string;
  name: string;
  hint: string;
}

/** 런처 검색 — 이름·힌트·키를 대소문자 무시 부분일치로 필터. 빈 질의는 전체 반환. */
export function filterApps<T extends SearchableApp>(apps: T[], query: string): T[] {
  const q = query.trim().toLowerCase();
  if (!q) return apps;
  return apps.filter(
    (a) =>
      a.name.toLowerCase().includes(q) ||
      a.hint.toLowerCase().includes(q) ||
      a.key.toLowerCase().includes(q),
  );
}

export interface SearchablePost {
  slug: string;
  title: string;
  excerpt: string;
}
export interface SearchableArtist {
  id: string;
  name: string;
}
export interface SearchablePhoto {
  id: string;
  title: string;
}

/** 통합 검색 입력. 각 도메인은 최소한의 검색 가능 필드만 필요. */
export interface SearchAllInput {
  apps: SearchableApp[];
  posts: SearchablePost[];
  artists: SearchableArtist[];
  photos: SearchablePhoto[];
}
export type SearchAllResult = SearchAllInput;

/** 런처 통합 검색 — 앱·글·아티스트·사진을 동시에. 빈 질의는 앱만 전체 반환
 *  (기존 "모든 앱 브라우징" 동작 유지). 글은 title·excerpt, 아티스트·사진은 name·title로 매칭. */
export function searchAll(input: SearchAllInput, query: string): SearchAllResult {
  const q = query.trim().toLowerCase();
  if (!q) return { apps: input.apps, posts: [], artists: [], photos: [] };
  return {
    apps: input.apps.filter((a) => a.name.toLowerCase().includes(q) || a.hint.toLowerCase().includes(q) || a.key.toLowerCase().includes(q)),
    posts: input.posts.filter((p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q)),
    artists: input.artists.filter((a) => a.name.toLowerCase().includes(q)),
    photos: input.photos.filter((p) => p.title.toLowerCase().includes(q)),
  };
}
