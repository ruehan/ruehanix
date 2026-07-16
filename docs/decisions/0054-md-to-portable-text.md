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

- 기존 13 → 11 → 12 케이스 (테스트 일부 중제거 + hr·image 추가 + image 분기 강화).
- `components/posts/PostBody.tsx` — `block.hr` handler + `image` 분기(md 경로 src/Sanity 경로 asset).
- 의존성 1개 (`@portabletext/markdown`).

## 라운드 1 (리뷰 후) — P0 회귀 + 정정

- P0: `PostBody.types.image` 가 `if (!v.asset) return null` 만으로 — md 이미지(`{src, alt}`) 통째로 null 렌더. 실제 `content/posts/*.md` 에 이미지가 없어 빌드는 통과했지만, 향후 md 한 줄 추가하면 사이트에서 사라짐. **수정: `v.src` 분기 추가 — md 경로 raw img 렌더.**
- ADR 정정: 본문 12 케이스(테스트 일부 중제거 + image 분기 강화). `PortableTextObject` 별도 union 추가 — `@portabletext/types` 가 PortableTextBlock 정의 자체에 `PortableTextTextBlock | PortableTextObject` union 포함하므로 `body: PortableTextBlock[]` 그대로 두는 것이 정합. 변경 없음.

## 차기

- table 처리 (Sanity의 `table` type 또는 remark-gfm).
- `---` 다음 머리말(`## heading`) — HR + heading 충돌 방지.