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

## 셸 UX

- 데스크톱 6개 워크스페이스 (Super+1-6), 각 ws 별 타일 + floating
- Hyprland 토글: `Super+G` floating, `Super+F` maximize, `Super+Q` close,
  `Super+Shift+1-6` move-to-ws, `Super+Shift+←/→` tile swap
- 9개 앱 모두 dynamic lazy — 첫 진입 시 visibleIds 가 비어 chunk 0회
  다운로드. 가시 시점 + dynamic loader 캐시로 minimize/restore 즉시.
- 단축키 전체: `/` 키 → Keybindings 탭.

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
| `npm run sync-posts` | md → NDJSON + Sanity dataset 일괄 import |
| `npm run sync-posts:check` | NDJSON 정합성 검사 (드리프트 감지) |

## 폴더 구조

```
app/                    Next.js App Router (페이지·레이아웃·메타)
components/ruehanix/    데스크톱 셸 — Win·Dock·9개 앱·ErrorBoundary·YouTubeEngine
components/posts/       SSR 포스트 본문 렌더링 (shiki 하이라이트 + CodeBlockClient)
content/posts/          마크다운 원본 + 동기화된 NDJSON (git 추적)
lib/posts/              포스트 정규화·frontmatter·shiki·group-by-folder
lib/ruehanix/           셸 상태(순수)·테마·키바인딩·스토리지·a11y·win-visibility
sanity/                 Sanity 스키마 (post/track/photo/artist/album)
scripts/                smoke·sync-posts·check-drift·기타 운영 스크립트
docs/                   ADR(0027~0042)·라운드별 리뷰·worklog
```

## 콘텐츠 운영

`content/posts/<slug>.md` 가 단일 진실. frontmatter 키:

```yaml
title: ...
slug: ...
category: dev
publishedAt: 2026-07-14
readingTime: 8분
excerpt: ...
```

`npm run sync-posts` 가 md → Sanity Portable Text NDJSON 변환 + **Sanity dataset
일괄 import** (ADR 0039). 토큰은 `SANITY_IMPORT_TOKEN` env. 미설정 시 ndjson
만 생성. `--no-import` / `--dry-run` 플래그로 import skip. 실패 시 throw.

코드 블록은 빌드 시점에 shiki 듀얼 테마(mocha/latte) HTML로 변환 +
`highlightedCode` 필드. Studio 직접 편집(필드 부재)시는 클라이언트
`CodeBlockClient` 가 lazy shiki 폴백. `lib/photos/groupByFolder` 가 folder
필드로 사진 분류, 빈 folder 는 `(미분류)` 자동 모음.

## Sanity Studio

`/studio` 에서 직접 편집. photoType 에 `folder` (string) + `description` (text)
필드 추가됨. `npm run sync-posts` 는 md → Sanity 단방향, Sanity → md
다운로드는 미지원.

## 영속화

- `rh-ui` (테마·액센트·UI 토글) — `lib/ruehanix/ui-storage.ts`
- `rh-player` (음악 플레이어 상태) — `lib/ruehanix/player-storage.ts`
- `rh-layout` v2 (창/워크스페이스/floating 위치) — `lib/ruehanix/layout-storage.ts`
  debounce 200ms 자동 저장, 부팅 1회 복원 (ADR 0036). v1→v2 마이그레이션은
  전체 DEFAULT 폴백(ADR 0036).

## CI

`.github/workflows/ci.yml` — PR·main 푸시마다 typecheck·lint·test·build 4
센서 + frontmatter 드프트 검사 자동 실행.

## 번들

- dynamic lazy 9개 앱 — 첫 진입 시 visibleIds 비어있어 chunk 0회 다운로드.
  가시 시점 + dynamic loader 캐시로 즉시.
- 측정 결과(2026-07-15): app-only chunks gzip **2.98MB** (raw 14.35MB,
  79% 압축). 상세: ADR 0042.

## 결정 기록

중요한 결정은 `docs/decisions/` 아래 ADR 로 남긴다. 라운드별 리뷰는
`docs/reviews/`, 작업 일지는 `docs/worklog.md`.

## 라이선스

Private. © 2026 ruehan.dev.