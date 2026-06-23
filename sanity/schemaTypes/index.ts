import type { SchemaTypeDefinition } from "sanity";
import { postType } from "./postType";
import { trackType } from "./trackType";
import { photoType } from "./photoType";
import { artistType } from "./artistType";

export const schemaTypes: SchemaTypeDefinition[] = [postType, trackType, photoType, artistType];
