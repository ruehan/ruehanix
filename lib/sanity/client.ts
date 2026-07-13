import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId, readToken } from "./env";

/** 콘텐츠 조회용 클라이언트.
 *  서버 전용 — 모든 호출처(lib/posts 등)는 서버 컴포넌트/라우트 핸들러라
 *  클라이언트 번들에 노출되지 않는다(useRuehanix·RuehanixShell은 props로 받음).
 *
 *  useCdn:false + readToken 사용 — 2026-07-14 import 글 1건이 apicdn.sanity.io와
 *  anonymous 라이브 API 양쪽 모두에서 보이지 않는 상태. readToken이 붙은 인증된
 *  라이브 API로 직접 읽어 가시성 확보. CDN/anon 복구되면 다음 두 라인을 원복:
 *    useCdn: true,
 *    token: undefined,
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: readToken,
});
