# ruehanix

한규(ruehan)의 기술 블로그/포트폴리오. Hyprland 스타일 데스크톱 셸을 닮은
데모이자 실제 운영 블로그다.

- Next.js 16 + React 19
- Sanity 6 (Studio + GROQ)
- styled-components 없이 인라인 `style={{}}` + CSS 변수
- vitest + happy-dom + Testing Library

## 빠른 시작

```bash
nvm use                 # Node 22 (저장소 .nvmrc 기준)
npm install
npm run dev             # http://localhost:3000
npm run studio          # /studio — Sanity Studio
```

## 스크립트

| 명령 | 설명 |
|---|---|
| `npm run dev` | Next 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 (build 이후) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (`eslint-config-next/core-web-vitals`) |
| `npm run test` | vitest 한 회 실행 |
| `npm run test:watch` | vitest 워치 |
| `npm run smoke` | Playwright 통합 스모크 (chromium 필요) |
| `npm run sync-posts` | `content/posts/*.md` → Sanity NDJSON 일괄 변환 |

## 폴더 구조

```
app/                    Next.js App Router (페이지·레이아웃·메타)
components/ruehanix/    데스크톱 셸 — Win·Dock·9개 앱·ErrorBoundary
components/posts/       SSR 포스트 본문 렌더링
content/posts/          마크다운 원본 + 동기화된 NDJSON
lib/posts/              포스트 정규화·frontmatter 파싱
lib/ruehanix/           셸 상태·테마·키바인딩·스토리지·a11y 등 순수 로직
sanity/                 Sanity 스키마
scripts/                smoke·md→Sanity 변환·기타 운영 스크립트
docs/                   ADR·리뷰 기록·worklog
```

## 콘텐츠 운영

`content/posts/<slug>.md` 가 단일 진실 공급원이다. frontmatter 는 다음 키를
필수로 한다.

```yaml
title: ...
slug: ...
category: dev
publishedAt: 2026-07-14
readingTime: 8분
excerpt: ...
```

`npm run sync-posts` 가 모든 md 를 읽어 Sanity Portable Text NDJSON 으로 변환해
같은 폴더에 `<slug>.ndjson` 으로 저장한다. `--dry-run` 으로 미리보기 가능.
생성된 ndjson 을 Sanity dataset 에 import 하면 사이트에 노출된다.

NDJSON 은 `npm run sync-posts` 의 출력 산물이지만 **git 추적 대상**이다 — Sanity
dataset 의 백업이자 PR 단위로 변경 이력을 본다는 운영 의도. 무시하려면
`.gitignore` 에 `content/posts/*.ndjson` 추가 검토.

## Sanity Studio

`/studio` 경로에서 컨텐츠를 직접 편집할 수 있다. Studio 변경 →
production dataset 으로 publish 가 일반 운영 흐름이다.
`npm run sync-posts` 는 md → Sanity 단방향이며 Sanity → md 다운로드는
지원하지 않는다.

## CI

`.github/workflows/ci.yml` — PR·main 푸시마다 typecheck·lint·test·build 4 센서
자동 실행. smoke 는 별도 잡 분리 시 추가 예정.

## 결정 기록

중요한 결정은 `docs/decisions/` 아래 ADR 로 남긴다. 새 결정을 내릴 때 함께
작성한다.

## 라이선스

Private. © 2026 ruehan.dev.