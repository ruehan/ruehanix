# 0035. CodeBlock 클라이언트 shiki 폴백

- 상태: 채택
- 날짜: 2026-07-14

## 배경

ADR 0034 의 shiki 통합은 **빌드 시점 (sync-posts.mjs)** 에서 `codeBlock.highlightedCode`
를 미리 생성해 Sanity dataset import 용 NDJSON 에 저장했다. 그러나 페이지
(`app/posts/[slug]/page.tsx`) 는 Sanity Content Lake 에서 **라이브 fetch** 하므로:

- Studio 에서 직접 편집한 글 (highlightedCode 필드 없음) → plain text.
- sync-posts 만 돌리고 Sanity import 를 안 한 경우 → 백업 NDJSON 만 있고 라이브
  dataset 은 옛날 데이터 → plain text.

두 경로 모두 색이 안 나오는 회귀.

## 결정

`CodeBlockClient` (client component) 도입. PostBody 의 codeBlock renderer 가
이 컴포넌트로 위임.

- `highlightedCode` 가 있으면 그대로 `dangerouslySetInnerHTML` 주입 (서버/사전
  생성 결과 사용).
- 없으면 useEffect + dynamic import(`shiki`) 로 lazy highlight.
  - shiki 가 무거우니 dynamic import — 첫 폴백 시점에만 chunk 다운로드.
  - 두 번째부터는 singleton `highlighterPromise` 재사용.
- 폴백 전 plain 표시 — SSR/하이드레이션 시 escape 한 텍스트 노출, 후 색 적용.

## 이유와 대안

- **Sanity dataset auto import 구축** — 운영적으로 정답이지만 토큰 + CI + Sanity API
  라운드트립 + sync-posts 와의 트랜잭션 정리 등 큰 작업. 차기.
- **Studio 플러그인으로 publish 시 shiki HTML 주입** — Sanity Studio plugin. 별도
  패키지 + 의존성. 차기.
- **PostBody 전체를 client component 로** — PortableText 도 client. hydration 비용
  + 기존 동작 변경. 거절.
- **CodeBlockClient 만 client, 나머지 server** — 단일 책임. 폴백 비용만 client. 채택.

## 영향

- Studio 직접 편집 / Sanity fetch 경로 / sync-posts 결과 (highlightedCode 없음) 모두
  색 적용.
- 첫 폴백 시점 shiki dynamic chunk 다운로드 — 그 후 0.
- SSR 시 plain → hydration 후 color — 시각적 미세 flicker (수십 ms). 의도된 trade-off.
- PostBody 자체는 server component 유지. CodeBlockClient 만 client island.

## 후속 작업

- Sanity dataset auto import (sync-posts.mjs 끝에 sanity CLI 호출 + 토큰 env).
- Studio publish 시 highlightedCode 자동 생성 plugin.