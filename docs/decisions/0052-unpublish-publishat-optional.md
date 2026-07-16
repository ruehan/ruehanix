# 0052. unpublish 시 publishedAt optional

- 상태: 채택
- 날짜: 2026-07-16

## 배경

ADR 0051 의 `published` 필드 추가 후, `published: false` 인 글이 `publishedAt`
없을 때 Sanity schema 의 `required` 검증으로 import 거부. 발행 시점이 없는
글에 발행일자 필드 — 의미 충돌.

## 결정

`scripts/sync-posts.mjs` 의 `validate` + `buildDoc` 보강:

- `validate`: `meta.published === false || meta.published === "false"` 일 때
  REQUIRED 에서 `publishedAt` 제외. (frontmatter 의 boolean 또는 "true"/"false"
  string 양쪽 받음.)
- `buildDoc`: `meta.publishedAt` truthy 일 때만 doc 에 포함. unpublish 면
  publishedAt 미포함 → Sanity schema 의 required 회피.

## 검증

dry-run 으로 4가지 케이스 확인:

| case | published | publishedAt | 결과 |
|---|---|---|---|
| published: true + 날짜 | true | 2026-07-15 | OK, publishedAt 포함 |
| published: false + 날짜 | false | 2026-07-15 | OK, publishedAt 포함 (의미상 무시) |
| published: false + 날짜 없음 | false | (없음) | OK, publishedAt 미포함 (validate 통과) |
| published: true + 날짜 없음 | true | (없음) | throw — REQUIRED 누락 (정상) |

## 영향

- 기존 4개 글 (`published: true` + `publishedAt`) 영향 X.
- 새 글 작성 시 `published: false` 만 적고 `publishedAt` 비워두면 unpublish 상태
  import 가능. 사이트 `/posts` 목록 제외 + 직접 URL 404 (GROQ 필터).
- `published: true` 인데 `publishedAt` 누락 시 throw — 사용자 실수 방지.

## 후속

- Studio 의 published 필드도 condition `validation` 추가 가능 — 더블 안전망.
- `publishedAt` 미래 날짜 시 예약 발행. 차기.