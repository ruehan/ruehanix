import type { SchemaTypeDefinition } from "sanity";
import { postType } from "./postType";
import { trackType } from "./trackType";

export const schemaTypes: SchemaTypeDefinition[] = [postType, trackType];
