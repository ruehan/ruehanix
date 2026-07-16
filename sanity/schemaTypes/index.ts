import type { SchemaTypeDefinition } from "sanity";
import { trackType } from "./trackType";
import { photoType } from "./photoType";
import { artistType } from "./artistType";
import { albumType } from "./albumType";

// postType 제거 — 블로그 글은 md 직접 fetch (lib/posts/queries.ts).
// 사진·음악·아티스트·앨범은 Sanity Studio에서 직접 편집.
export const schemaTypes: SchemaTypeDefinition[] = [trackType, photoType, artistType, albumType];
