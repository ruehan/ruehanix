# 0030. md → Sanity 단방향 자동 변환 (sync-posts)

- 상태: 채택
- 날짜: 2026-07-14

## 배경

콘텐츠 운영 흐름은 두 갈래였다.

- (a) `scripts/md-to-sanity-post.mjs` — 한 파일씩 인자 6개(slug·title·
  publishedAt·excerpt·readingTime)를 받아 NDJSON + 백업 md 생성. CLI 호출
  부담 + 인자 오기 쉬움.
- (b) `content/posts/*.md` + `daily-md-local-standup.ndjson` 같이 md 가
  이미 frontmatter 를 가진 상태로 존재. 즉 frontmatter 가 단일 진실이지만
  변환 도구는 그걸 모르고 CLI 인자로 다시 받음.

콘텐츠 추가 시마다 6개 인자를 손으로 복사·붙여넣기 하는 비효율, 그리고
md 와 ndjson 의 drift 위험이 있었다.

## 결정

`scripts/sync-posts.mjs` 도입. `content/posts/*.md` 를 일괄로 읽고
frontmatter 를 자동 인식해 같은 폴더에 `<slug>.ndjson` 을 만든다.
`npm run sync-posts` 로 호출. `--dry-run` 으로 미리보기 가능.

frontmatter 파서는 `lib/posts/frontmatter.ts` 의 `parsePostFrontmatter` 가
정본. .mjs 가 .ts 를 직접 import 하지 못하는 환경을 위해 동일 로직을
sync-posts.mjs 안에 인라인 — 두 구현이 어긋나면 잘못된 NDJSON 이 나오므로
frontmatter.ts 변경 시 sync-posts.mjs 의 파서도 함께 갱신한다.

변환 결과는 Sanity Portable Text 정규 형식(`_key`·`children`·`span`·`markDefs`)
을 따른다 — 기존 daily-md-local-standup.ndjson 형식과 호환.

## 이유와 대안

- **현재 도구 유지** — 손으로 6개 인자. 비효율. 거절.
- **gray-matter 도입** — 의존성 추가. frontmatter 가 `key: value` 한 줄 형식으로
  충분해 자체 파서로 처리. YAGNI. 거절.
- **Sanity → md 양방향** — 손실·충돌 가능성 관리 필요. 큰 작업. 차기 작업으로 보류.

## 영향

- 글 추가 운영이 `npm run sync-posts` 한 줄로 단순화. CI 에서 호출 가능.
- 기존 ndjson 파일은 다음 sync 호출 시 재생성되며 형식은 호환.
- 변환기는 `lib/posts/frontmatter.ts` 와 동기화 의무. PR 리뷰 시 확인 필요.