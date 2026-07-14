# 리뷰 기록 — shiki 코드 하이라이트

- 날짜: 2026-07-14
- 브랜치: feat/code-highlight
- 최종 판정: 통과 (1라운드, self-review)

## 1라운드

- 검증: vitest 28 files / 214 tests (highlightCode 3/3 신규) / build 11/11 / smoke 24/24.
- 로컬 `npm run sync-posts` 로 NDJSON 2개 재생성 완료 (highlightedCode 포함).
- `npm run sync-posts:check` — 2 파일 일치 ✓.

### 검토 결과

- shiki 듀얼 테마 HTML 빌드 시점 생성 — 클라이언트 JS 0. PostBody 단순 주입.
- PostBody 가 client context(ReaderApp 자식) 라 async 못 하는 제약 회피.
- catppuccin mocha/latte 듀얼. 사이트 기존 팔레트와 정합.
- `.rh-codeblock` + `html.rh-light` CSS 변수로 다크/라이트 토글. JS 0.
- CodeCopyButton — useState + clipboard API, 1.5s 토스트. 작은 client island.
- XSS: shiki 가 escape 한 HTML 만 주입. fallback (highlightedCode 부재) 도 단순 wrap.

### 결함

없음.

### 보강 (후속)

- `prefers-color-scheme` 자동 토글 — 사이트 정책(html.rh-light 명시)과 정합로 미반영.
- shiki grammar lazy load (24개 pre-load 적정, 추가 시 lazy 검토).
- 줄 번호 — 이번엔 미포함. 사용자가 명시적으로 요청 시 추가.