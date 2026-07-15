# 0043. Next.js `experimental.optimizePackageImports`

- 상태: 채택 (영향 미미 측정, 안전 가드)
- 날짜: 2026-07-15

## 배경

ADR 0042 의 chunk 측정 결과 app-only gzip 2.94MB. 큰 vendor (sanity, next-sanity,
@sanity/vision) 가 tree-shake 되면 더 줄지 않을까. Next 16 의 `optimizePackageImports`
는 named import 의 barrel file 재작성으로 tree-shake 효과.

## 결정

`next.config.mjs` 의 `experimental.optimizePackageImports` 에
`["@sanity/image-url", "next-sanity", "@sanity/vision"]` 추가.

## 측정 결과

| 항목 | 최적화 전 (0042) | 최적화 후 (0043) |
|---|---|---|
| app-only gzip | 2.98MB | 2.94MB |
| app-only raw | 14.35MB | 13.68MB |
| 전체 chunks gzip | 4.79MB | 4.57MB |
| chunks 파일 수 | 362 | 362 |

raw 4.7%·gzip 1.3% 감소 — 측정 효과 작음. 이미 build pipeline 의 tree-shake
(SSR + client 코드 분리) 가 효과적이라 추가 향상 여지가 적음. 큰 vendor
(`next-sanity/studio` 의 NextStudio) 가 Studio 페이지 dynamic lazy 에서만
로드되어 client bundle 에 포함 안 됨.

## 영향

- 옵션 추가로 빌드 OK, 1.3% gzip 감소. 안전.
- 3개 패키지 모두 `lib/sanity/`, `sanity.config.ts`, `app/studio/` 에서
  사용. server-side (queries, image-builder) 위주 — client 번들에 적게 포함.

## 후속

- (선택) `next-sanity` client-side import 별도 분리 — 현재 client import
  없음. 분할 가치 X.
- (차기) 추가 vendor (`@testing-library/*` 는 devDeps 이라 무관).