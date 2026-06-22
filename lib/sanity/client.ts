import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "./env";

/** 공개 콘텐츠 조회용 클라이언트(CDN 캐시 사용, 토큰 불필요). */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
});
