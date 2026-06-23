import type { ArtistInfo } from "@/lib/ruehanix/types";
import type { SanityArtistDoc } from "./types";

/** Sanity artist 문서/역참조 → ArtistInfo. 이름이 없으면 null. 링크는 label·url 모두 있는 것만. */
export function toArtistInfo(a: SanityArtistDoc | null | undefined): ArtistInfo | null {
  if (!a || typeof a.name !== "string" || !a.name) return null;
  const links = Array.isArray(a.links)
    ? a.links.filter((l): l is { label: string; url: string } => !!l && typeof l.label === "string" && !!l.label && typeof l.url === "string" && !!l.url)
    : [];
  return {
    id: typeof a.id === "string" ? a.id : "",
    name: a.name,
    photoUrl: typeof a.photoUrl === "string" ? a.photoUrl : "",
    bio: a.bio ?? "",
    genre: a.genre ?? "",
    origin: a.origin ?? "",
    links: links.map((l) => ({ label: l.label, url: l.url })),
  };
}

/** artist 문서 배열 → ArtistInfo 배열(이름 없는 문서 제외). */
export function normalizeArtists(docs: SanityArtistDoc[] | undefined): ArtistInfo[] {
  if (!Array.isArray(docs)) return [];
  const out: ArtistInfo[] = [];
  for (const d of docs) {
    const info = toArtistInfo(d);
    if (info) out.push(info);
  }
  return out;
}
