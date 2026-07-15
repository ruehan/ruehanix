# 0041. package.json `type: "module"`

- 상태: 채택
- 날짜: 2026-07-15

## 배경

`npm run sync-posts:check` 실행 시 Node 22 의 `[MODULE_TYPELESS_PACKAGE_JSON]`
경고 — `lib/posts/frontmatter.ts` ESM 파일을 .ts 그대로 import 하지만
`package.json` 에 `type` 미선언. Node 가 CommonJS 로 추론 후 ESM 감지하여
reparse. 성능 손실 + 도구 노이즈.

## 결정

`package.json` 에 `"type": "module"` 추가. 모든 스크립트 + config 가
ESM-default. 기존 `.mjs`/`.js` 코드(`scripts/*.mjs`, `next.config.mjs`,
`sanity.cli.ts`, `sanity.config.ts`) 는 모두 ESM. CommonJS 코드 없음.

## 영향

- Node 가 .ts / .js 모두 ESM 으로 직접 파싱. reparsing 경고 제거.
- `node scripts/*.mjs` 직접 실행 OK (이전부터).
- `node --experimental-strip-types scripts/check-frontmatter-drift.mjs` — 경고 없이
  깔끔.
- Vitest / Next.js / Sanity CLI 모두 ESM 호환. 영향 X.
- 도구 인식: `find . -name "*.cjs"` — 0건. tsconfig module=esnext. 안전.

## 후속

- (선택) tsconfig `module: "nodenext"` 검토 — Next 16 의 Webpack/Turbopack 환경
  영향 큼. 보류.