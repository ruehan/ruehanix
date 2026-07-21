import type { ArtistInfo } from "@/lib/ruehanix/types";
import type { SanityArtistDoc } from "./types";

/** Sanity artist 문서/역참조 → ArtistInfo. 이름이 없으면 null. 링크는 label·url 모두 있는 것만,
 *  멤버는 name이 있는 것만(role·photoAsset은 선택). */
export function toArtistInfo(a: SanityArtistDoc | null | undefined): ArtistInfo | null {
  if (!a || typeof a.name !== "string" || !a.name) return null;
  const links = Array.isArray(a.links)
    ? a.links.filter((l): l is { label: string; url: string } => !!l && typeof l.label === "string" && !!l.label && typeof l.url === "string" && !!l.url)
    : [];
  const members = Array.isArray(a.members)
    ? a.members
        .filter((m) => !!m && typeof m.name === "string" && !!m.name)
        .map((m) => ({
          name: m.name!,
          role: typeof m.role === "string" ? m.role : "",
          photoAsset: m.photoAsset ?? null,
        }))
    : [];
  return {
    id: typeof a.id === "string" ? a.id : "",
    name: a.name,
    photoAsset: a.photoAsset ?? null,
    bio: a.bio ?? "",
    genre: a.genre ?? "",
    origin: a.origin ?? "",
    links: links.map((l) => ({ label: l.label, url: l.url })),
    members,
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
