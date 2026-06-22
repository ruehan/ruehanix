function required(value: string | undefined, name: string): string {
  if (!value) throw new Error(`환경변수 누락: ${name} (.env.local 확인)`);
  return value;
}

export const projectId = required(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID, "NEXT_PUBLIC_SANITY_PROJECT_ID");
export const dataset = required(process.env.NEXT_PUBLIC_SANITY_DATASET, "NEXT_PUBLIC_SANITY_DATASET");
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01";

/** 읽기 토큰은 서버 전용(클라이언트 번들에 노출 금지). 초안/비공개 조회용.
 *  현재 어댑터는 공개 CDN 클라이언트만 쓰므로 미사용 — 미리보기/초안 라우트를
 *  붙이는 후속 작업(ADR 0007 백로그)에서 token 클라이언트로 배선한다. */
export const readToken = process.env.SANITY_API_READ_TOKEN;
