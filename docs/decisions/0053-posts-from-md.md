# 0053. blog posts 를 md 직접 fetch (Sanity fetch 제거)

- 상태: 채택
- 날짜: 2026-07-16

## 배경

Sanity 의 postType schema 의 `publishedAt: required` 검증이 `published: false`
에서도 그대로 적용. sync-posts 가 `publishedAt` 없이 import 시 거부. schema
deploy 가 수동 + Studio 자동 deploy 가 의존적. 운영 마찰.

## 결정

**블로그 글 (post) 은 Sanity fetch 제거. `content/posts/*.md` 직접 import.**

- `lib/posts/markdown.ts` (신설) — `toPortableText(md)` + `buildPost(meta, body)`.
  Portable Text 블록 변환 (헤딩/blockquote/codeBlock/표/normal). 11 케이스 TDD.
- `lib/posts/queries.ts` — `getAllPosts`/`getPost`/`getSlugs` 가 fs.readdirSync +
  parsePostFrontmatter + buildPost. `published: false/'false'` 필터.
  정렬은 ISO `publishedAt` (desc). 정적 생성 — 빌드 시 md 읽음.
- `lib/posts/types.ts` — `BlogPost.published?: boolean` optional. `date` 별도.
- `lib/posts/frontmatter.ts` — `PostMeta.published?: string`.

**제거** (post 운영 도구):
- `scripts/sync-posts.mjs` — ndjson 백업 + Sanity import
- `scripts/check-frontmatter-drift.mjs` — 의미 X (md 가 진실)
- `app/api/revalidate/route.ts` — 정적 빌드로 불필요
- `sanity/schemaTypes/postType.ts` — Studio 에서 글 작성 안 함
- `package.json` 의 `sync-posts`, `sync-posts:check` scripts

**유지** (사진·음악·아티스트·앨범 Sanity Studio):
- `sanity.config.ts` (Studio), `sanity.cli.ts` (CLI), `app/studio/[[...tool]]/`
- `sanity/schemaTypes/{track,photo,artist,album}Type.ts`
- `lib/{tracks,photos,artists,albums}/...` Sanity fetch
- `useRuehanix` 의 photo/track State

## 효과

- post 운영: `content/posts/<slug>.md` 만 관리. PR + sync 자동.
- unpublish: frontmatter `published: false` (publishedAt 없어도 OK). GROQ 필터로 사이트 제외.
- 사진·음악: Sanity Studio 에서 직접 (image upload, reference 등 Sanity 강점 유지).
- Sanity 토큰 의존 제거 (post 운영 한정) — `SANITY_IMPORT_TOKEN` 더 이상 불필요.

## 후속

- focus-trap 의 `published: false` 가 unpublish 의도였는지 확인 — 사용자가 다시 `true` 원하면 md 수정.
- `focus-trap` ndjson 의 옛 `publishedAt` 잔재 → Sanity dataset 정리 (Studio 에서 직접 또는 Studio 에서 unpublish 후 sync).
- `.env.local` 에서 `SANITY_IMPORT_TOKEN` 제거.