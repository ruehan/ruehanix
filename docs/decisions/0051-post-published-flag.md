# 0051. Post `published` 플래그 + GROQ 필터

- 상태: 채택
- 날짜: 2026-07-16

## 배경

`npm run sync-posts` 가 모든 md → Sanity import. **unpublish 한 글도 다시
published 로 덮어써짐** — `--replace` 가 `createOrReplace` (upsert) 라
기본값(published: true) 으로 매번 갱신. Studio 에서 수동 unpublish 가
sync-posts 1회로 무효화.

## 결정

`published` 필드 추가:
1. `sanity/schemaTypes/postType.ts` — `published: boolean` (initialValue: true, unpublish 시 false).
2. `content/posts/*.md` frontmatter `published: true|false` (생략 시 true).
3. `sync-posts.mjs` `buildDoc` — frontmatter 의 "true"/"false" string 을 boolean
   으로 변환 후 포함. `meta.published === undefined ? true : meta.published === true || meta.published === "true"`.
4. `lib/posts/queries.ts` GROQ — `published != false` 필터 + `published` 필드 투영. ALL_POSTS / ONE_POST / ALL_SLUGS 모두.

## 효과

- frontmatter `published: false` → Studio 에서 unpublish 상태 + 사이트 목록/검색
  제외 + 직접 URL 도 차단 (404).
- 기본값(생략)은 true → 기존 동작 유지.
- sync-posts 실행 시에도 unpublish 상태 보존 (덮어쓰지만 published=false 로).
- Studio 에서 수동 publish/unpublish 도 가능 (양방향 — 하지만 우리 정책은 md 가
  진실, ADR 0030).

## 영향

- `published` 필드는 default true 라 기존 4개 글 영향 X. **다음 sync-posts 부터
  published 필드 포함된 ndjson** — Studio 에 `published: true` 가 명시적으로
  들어감.
- queries.ts 의 GROQ 가 `published != false` 라 null/undefined 도 통과 →
  기존 doc (published 없음) 도 노출 유지.
- 새 글 작성 시 frontmatter `published: false` 로 draft 가능.

## 후속

- `publishedAt` 도 의미 변경 — 미래 날짜 시 예약 발행. 차기.
- Studio 의 `published: false` 수동 변경은 sync-posts 시 덮어써짐 (md 가 진실
  정책) — 사용자가 unpublish 영구 원하면 frontmatter 직접 false.