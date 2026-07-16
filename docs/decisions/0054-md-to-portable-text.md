# 0054. md → Portable Text 변환기 교체 (@portabletext/markdown)

- 상태: 채택
- 날짜: 2026-07-16

## 배경

`lib/posts/markdown.ts` 의 `toPortableText` 가 줄 단위 파싱 직접 구현.
`---` 같은 horizontal rule, 이미지, 표 등 GFM 요소를 처리하지 못해 —
daily-md-local-standup 글에서 `---` 가 텍스트로 그대로 노출됨. 마크다운
다양성을 직접 구현하는 것보다 검증된 도구를 쓰는 것이 안전.

## 결정

`@portabletext/markdown` (Sanity 공식, v1.4.4) 도입. md → PT 변환을
라이브러리에 위임 + 우리 스키마에 맞게 **post-process**:

- `@portabletext/markdown` 의 `code` → 우리 스키마의 `codeBlock` (rename)
- `horizontal-rule` → `block` style `"hr"` (PostBody 의 block renderer)
- 표 (`| a | b |`) — **미처리** (행 단위로 풀어짐). 차기 과제. (현재 표 사용 글 없음.)
- image `![alt](url)` → `image` (PostBody.types.image 처리)

## 영향

- 기존 13 → 11 케이스 (테스트 일부 중복 제거). hr·image 추가.
- `lib/posts/types.ts` — `BlogPost.body` 의 union 에 `PortableTextObject` 추가.
- `components/posts/PostBody.tsx` — `block.hr` handler 추가 (수평선).
- 의존성 1개 (`@portabletext/markdown`).

## 차기

- table 처리 (Sanity의 `table` type 또는 remark-gfm).
- `---` 다음 머리말(`## heading`) — HR + heading 충돌 방지.