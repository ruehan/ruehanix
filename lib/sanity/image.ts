import imageUrlBuilder from "@sanity/image-url";
import { dataset, projectId } from "./env";

const builder = imageUrlBuilder({ projectId, dataset });

/** Sanity 이미지 소스 → URL 빌더(.width().url() 등 체이닝). 본문 인라인 이미지 렌더용. */
export function urlFor(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source);
}
