# 리뷰 기록 — CodeBlockClient shiki 폴백

- 날짜: 2026-07-14
- 브랜치: feat/codeblock-client-fallback
- 최종 판정: 통과 (1라운드, self-review)

## 1라운드

- 검증: vitest 28 files / 217 tests (CodeBlockClient 3/3 신규) / build 11/11 / smoke 24/24.

### 검토 결과

- CodeBlockClient client component — `highlightedCode` 있으면 그대로, 없으면 dynamic shiki lazy.
- PostBody server component 유지. 단일 client island.
- shiki dynamic import — 첫 폴백 시점에만 chunk 다운로드. singleton 재사용.
- ESLint disable 한 줄 (react/no-danger) — shiki escape HTML.
- escapeHtml 헬퍼 — plain text 폴백도 XSS 안전.

### 결함

없음.

### 보강 (차기)

- Sanity dataset auto import — sync-posts.mjs 끝에 sanity CLI 호출 + 토큰 env.
- Studio publish 시 highlightedCode 자동 생성 plugin.