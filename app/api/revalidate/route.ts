/**
 * on-demand revalidation 엔드포인트. CDN edge race(deploy 직후 일부 edge 만 새 빌드 노출) 해결용.
 * x-revalidate-secret 헤더 검증 후 셸·글 목록·(옵션) 글 상세 경로를 invalidate 한다.
 */
import { revalidatePath } from "next/cache";
import { revalidateSecret } from "@/lib/sanity/env";

export async function POST(request: Request) {
  const provided = request.headers.get("x-revalidate-secret");
  if (!revalidateSecret || provided !== revalidateSecret) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  revalidatePath("/posts");

  let slug: string | null = null;
  try {
    const body = (await request.json()) as { slug?: unknown };
    if (typeof body?.slug === "string" && body.slug.length > 0) {
      slug = body.slug;
      revalidatePath(`/posts/${slug}`);
    }
  } catch {
    // body 가 비어있거나 JSON 이 아니면 slug revalidation 은 생략.
  }

  return Response.json({ revalidated: true, slug });
}