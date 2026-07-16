# 리뷰 기록 — posts-from-md (Sanity fetch 제거)

- 날짜: 2026-07-16
- 브랜치: feat/posts-from-md
- 최종 판정: 통과 (2라운드)

## 1라운드

- 판정: 수정 필요 (P1 2건 + P3 2건)
- 검증: typecheck 0 / eslint 0 / vitest 285 / build 11/11 / smoke 24/24

### 지적사항

- [P1] 명령 팔레트 `shell:sync-posts` 잔재 — `/api/sync-posts` 라우트 없음. 클릭 시 404.
- [P1] `category: blog` 의 silent fallback — `buildPost` 가 `"dev"` 로 강제. 두 글의 의도 손실.
- [P3] 중복 주석 (`markdown.ts`).
- [P3] `markdown.test.ts` EOF newline 없음.

### 반영

- `shell:sync-posts` 명령 + `commands.test.ts` fixture 제거.
- `blog` 카테고리 정식 도입:
  - `lib/ruehanix/types.ts` — `CatKey` union + `"blog"`.
  - `lib/ruehanix/data.ts` — `CATS.blog` (#a6e3a1).
  - `lib/ruehanix/theme.ts` — `catColors` 다크 #89b4fa 식 라이트/다크에 blog 추가.
  - `lib/posts/markdown.ts` — `VALID_CATEGORIES` + "blog".
- `markdown.ts` 중복 주석 정리.
- `markdown.test.ts` EOF newline 추가.

## 2라운드

- 판정: 수정 필요 (P2 + P3 + HARNESS GAP)
- 검증: 모두 통과.

### 지적사항

- [P2] `lib/posts/normalize.ts:5` — 로컬 `CATS: CatKey[] = ["dev", "sim", "moto", "music"]` 화이트리스트에 `"blog"` 미포함. 라운드 1 P1 의 같은 클래스 결함 잔존. 단 `normalizePost` 가 데드 코드 (Sanity fetch 제거됨). 함수 자체 제거 권장.
- [P3] `markdown.test.ts` — `category: "blog"` 단위 테스트 부재.
- [HARNESS GAP] `docs/worklog.md` + `docs/reviews/2026-07-16-posts-from-md.md` — 라운드 1 review 시점에 없었음. 머지 전 작성.

### 반영

- `lib/posts/normalize.ts` — `normalizePost` / `sanitizeBody` / `CATS` / `SanityPostDoc` 제거. `formatDate` 만 유지 (queries.ts 가 사용).
- `lib/posts/types.ts` — `SanityPostDoc` 제거.
- `lib/posts/normalize.test.ts` — `normalizePost` describe 제거, import 정리.
- `markdown.test.ts` — `category: "blog"` / `category: "unknown" → "dev"` 2 케이스 추가.
- `docs/worklog.md` — 항목 추가.
- 본 review 파일 작성.

## 검증

- vitest 285 → 287.
- typecheck 0 / eslint 0 / build 11/11 / smoke 24/24.

## 후속

- Sanity dataset 의 옛 post doc 은 Studio 에서 안 보임 (postType 제거) → Studio 에서 직접 정리 또는 무시 (사이트 표시는 md 만).
- `.env.local` 의 `SANITY_IMPORT_TOKEN` 제거 (사용자 결정).
- focus-trap 의 `published: false` 가 unpublish 의도였는지 확인 — 사용자.
- sync 도구 자동화 (Sanity webhook + md 자동 갱신) — 양방향. 차기.