# 0008. 글 라우트(/posts) + SEO 구현

- 상태: 채택
- 날짜: 2026-06-22
- 관련: [[0006-content-seo-strategy]], [[0007-sanity-embedded-studio]]

## 배경

ADR 0006/0007에서 소스 추상화와 `/posts/[slug]` 라우트를 계획했다. Sanity CORS 등록이
미뤄져 스튜디오에 글을 못 넣는 상황이라, **하드코딩 소스로 라우트·SEO를 먼저 완성**하고
나중에 어댑터만 Sanity로 교체한다(설계가 소스 무관이라 가능).

## 결정

### 1. 소스 추상화
- `lib/posts/source.ts`가 단일 진입점(`getAllPosts`/`getPost`/`getSlugs`). 지금은 하드코딩
  어댑터(`hardcoded.ts`)를 re-export, 나중에 `./queries`(Sanity)로 한 줄 교체.
- `BlogPost.body`는 **문단 문자열 배열**로 통일(소스 무관). Sanity normalize는 Portable Text를
  문단으로 추출(`portableTextToParagraphs`). 하드코딩 글은 이미 문단 배열.
- 슬러그는 영문 수동 부여(8글). 한글 제목→슬러그 변환의 모호함을 피하고 안정적 URL 확보.

### 2. 라우트
- `app/posts/[slug]/page.tsx` — RSC, `generateStaticParams`(SSG)·`generateMetadata`
  (title/description/canonical/og:article)·JSON-LD `BlogPosting`. ruehanix 테마 독립 글 페이지.
- `app/posts/page.tsx` — 글 목록(검색엔진·사람용 인덱스).
- `app/sitemap.ts`·`app/robots.ts`(`/studio` 차단)·`app/feed.xml/route.ts`(RSS 2.0).
- RSS XML 빌더·XML 이스케이프는 순수 함수(`rss.ts`)로 분리해 vitest.

### 3. 셸 연결
- 셸 Reader는 현행 내부 렌더 유지 + "전체 페이지로 보기 →" 링크로 `/posts/[slug]`에 연결
  (id→슬러그 `slugForId`). 셸을 벗어나지 않는 최소 연결.
- `slugForId`도 `source.ts`에서 re-export하고 셸은 source만 import한다(단일 진입점 일관성 —
  소스 교체 시 셸 매핑도 함께 따라오도록).

## 이유와 대안

- **하드코딩 소스로 먼저(대안: Sanity 글 채운 뒤)** — Sanity CORS 대기 중이라도 라우트·SEO는
  소스 무관하게 완성 가능. 추상화 덕에 나중에 어댑터만 교체. 진행을 막지 않는다.
- **body 문단 배열 통일** — 셸 Reader·라우트·두 소스(하드코딩 string[], Sanity Portable Text)를
  한 형식으로 맞춰 렌더 코드 단일화. Portable Text의 리치 마크업은 후속(현재 문단만).
- **셸 navigate 대신 링크** — Reader가 라우트로 완전 이동하면 SPA 경험이 끊긴다. 내부 렌더는
  유지하고 공유·SEO용 전체 페이지는 별도 링크로 제공.

## 영향
- `/posts/[slug]` 8개 SSG 프리렌더, sitemap·robots·feed 생성(빌드 확인). 검색엔진 노출·공유 가능.
- vitest 47개(소스·RSS 포함), smoke 16개(글 라우트·sitemap 추가).
- 다음: 하드코딩→Sanity 어댑터 교체(CORS 등록 후), Portable Text 리치 렌더(코드블록·이미지),
  글별 동적 OG, 카테고리별 목록/필터.
