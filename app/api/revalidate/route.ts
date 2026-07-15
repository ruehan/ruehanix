import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * sync-posts.mjs 가 Sanity import 후 ISR 페이지 무효화.
 * body / secret header 검사. dev (no token env) 는 secret 없이 허용.
 *
 * POST /api/revalidate
 *   header: x-revalidate-secret: <token>
 *   응답: 200 { revalidated: ["/", "/posts", ...] } | 401
 *
 * env: REVALIDATE_SECRET (운영). 미설정 시 dev 로 간주, secret 검사 skip.
 */
export async function POST(req: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  const got = req.headers.get("x-revalidate-secret");
  if (expected) {
    if (got !== expected) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  // 재검증 경로 — 새 글 추가 시 영향 범위. 정적 페이지는 revalidatePath 로 충분.
  // /posts/[slug] 는 dynamic route — 자동. 단 안전을 위해 list 에 포함.
  const paths = ["/", "/posts", "/feed.xml", "/sitemap.xml"];
  for (const p of paths) revalidatePath(p);
  return NextResponse.json({ revalidated: paths });
}

export function GET() {
  return NextResponse.json({ ok: true, hint: "POST with x-revalidate-secret header" });
}