# 0034. shiki 코드 하이라이트 (catppuccin 듀얼)

- 상태: 채택
- 날짜: 2026-07-14

## 배경

블로그 글의 코드 블록이 모두 plain text 처럼 보였다(언어 무관, 단색). Sanity
portable text 의 `codeBlock` 노드(`{ _type, language, code }`) 를 그대로
`<pre><code>` 로 렌더해 토큰화 없음.

## 결정

**빌드 시점(sync-posts.mjs) 에서 shiki 로 듀얼 테마 HTML 을 미리 생성**해
`codeBlock.highlightedCode` 필드에 저장한다. PostBody 는 그 HTML 을
`dangerouslySetInnerHTML` 로 주입만 — 클라이언트 JS 토큰화 없음.

- 라이브러리: shiki (VitePress·Astro 표준, SSR HTML 출력)
- 테마: catppuccin-mocha (다크) + catppuccin-latte (라이트) — 사이트 기존
  팔레트와 정합
- 듀얼 테마: shiki `defaultColor: false` → 각 토큰이 `--shiki-dark` / `--shiki-light`
  CSS 변수로 출력. `globals.css` 의 `.rh-codeblock` 룰이 `html.rh-light` 토글에
  따라 두 변수 중 하나를 color 로 적용.
- 언어 라벨: 코드 블록 상단 헤더에 `<div>` 로 (이미 코드 자체)
- 복사 버튼: `CodeCopyButton` (작은 client island, useState + clipboard API)

## 이유와 대안

- **prism / highlight.js** — 클라이언트 JS 토큰화. 본 작업의 "클라이언트 JS 0" 목표와
  정면 충돌. 거절.
- **PostBody 안에서 useEffect+shiki** — SSR 시 plain → hydration 시 highlighted.
  mismatch 우려 + UX 깜빡임. 거절.
- **PostBody 자체를 server component 로** — PostBody 가 ReaderApp (client) 의 자식이라
  트리 상단에서 client. server 로 강제하려면 트리 분리 필요. 거절.
- **빌드 시점 미리 생성 채택** — async 부하가 모두 sync-posts 단계로 이동. PostBody
  / page / ReaderApp 모두 변경 없음. 기존 NDJSON 재생성만 하면 적용.

## 영향

- NDJSON 2개 (daily-md-local-standup, ruehanix-desktop-blog) 가 `highlightedCode`
  필드를 가지며 약 3~4배 커짐 (highlightedCode 가 큰 inline HTML).
- 빌드 시 sync-posts 1회 호출로 모든 글 재생성.
- shiki deps 추가 (~1MB). grammar lazy load 안 함 — 자주 쓰는 24개 미리 로드.
- 듀얼 테마 전환은 JS 0, CSS 변수 0~1개 변경.

## 후속 작업

- `post.${slug}.ndjson` 의 highlightedCode 가 너무 커지면 gzip 압축 의존. 현재 크기 적정.
- `prefers-color-scheme` 자동 토글은 사이트 정책(html.rh-light 명시 토글) 우선이므로 미반영.