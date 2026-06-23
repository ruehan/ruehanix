import type { SchemaTypeDefinition } from "sanity";
import { postType } from "./postType";
import { trackType } from "./trackType";
import { photoType } from "./photoType";

export const schemaTypes: SchemaTypeDefinition[] = [postType, trackType, photoType];
