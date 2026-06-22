# 0006. 콘텐츠 관리 · SEO 운영 계획

- 상태: 채택(계획) — 실제 구현은 후속 /feature로 분리
- 날짜: 2026-06-22
- 관련: [[0002-nextjs-conversion]]

## 배경

현재 블로그 글·랩타임·사진이 `lib/ruehanix/data.ts`에 **하드코딩**되어 있다. 진짜 블로그가
아니고, 글마다 공유 URL이 없으며, 단일 CSR 셸이라 검색엔진에 노출되지 않는다(SEO 0).
요구: (1) 로컬에서만 쓰지 않아도 되는, 커스터마이징 가능한 콘텐츠 관리, (2) 제대로 된 SEO.
이 문서는 그 운영 계획이며, 코드 구현은 다음 단계로 분리한다.

## 결정 (방향)

### 1. 글 라우트 — `/posts/[slug]` 서버 컴포넌트 (확정)
- 글마다 서버렌더 URL. `generateStaticParams`로 SSG, `generateMetadata`로 글별 메타·OG.
- 데스크톱 셸은 그대로 두고, 셸 안 Reader는 **같은 글 소스를 클라에서 렌더**(또는 라우트로 이동).
  즉 "인터랙티브 셸 + SEO 가능한 글 라우트" 하이브리드.
- 공유·검색·OG 미리보기가 라우트에서 동작. 셸은 탐색/브랜딩 경험.

### 2. 콘텐츠 소스 — 옵션 비교 (최종 선택은 다음 단계 사용자와)
요구가 "꼭 로컬 작성 아니어도 + 커스터마이징"이라 웹 편집형을 우선 본다.

| 소스 | 웹 편집 | 비용 | 커스터마이징 | Next 궁합 | 단점 |
|---|---|---|---|---|---|
| 로컬 MDX | ✗(git) | 무료 | ★★★ | ★★★ | 웹 편집 불가 — 요구 불충족 |
| **Sanity** | ✓ 스튜디오 | 무료 티어 | ★★★ 스키마 자유 | ★★★ | 초기 설정 있음 |
| Notion API | ✓ 노션 | 무료 | ★★ 블록 한정 | ★★ | 이미지 URL 만료, 빌드 fetch |
| Decap/Tina(Git CMS) | ✓ 웹 UI | 무료 | ★★ | ★★ | 인증·호스팅 설정 |

- **추천: Sanity.** 웹 스튜디오에서 글 작성·관리, 스키마를 직접 정의(커스터마이징 ★), 무료 티어,
  이미지 CDN, GROQ 쿼리, ISR/웹훅 재검증과 궁합 좋음. "로컬 아니어도 + 커스터마이징" 요구에 부합.
- 차선: Notion(가장 빠른 시작, 단 이미지·구조 제약). 
- 추상화: `entities/post`에 **소스 인터페이스**(`getAllPosts`/`getPost`/`getSlugs`)를 두고, 어댑터로
  소스 교체 가능하게 한다. 지금 하드코딩 → 어댑터를 Sanity로 바꾸면 됨(점진 이전).

### 3. 글 모델 (frontmatter/스키마)
`slug, title, date, category(dev|sim|moto|music), excerpt, readingTime, body(portable text/MDX), cover?, tags[]`.
하드코딩 POSTS를 이 형태로 먼저 정규화(소스 무관) → 이후 어댑터만 교체.

### 4. SEO 운영
- **메타데이터**: `app/layout.tsx`에 사이트 기본(title template, description, metadataBase, openGraph,
  twitter), 글 라우트에 `generateMetadata`(글별 title/desc/og:image/canonical).
- **OG 이미지**: `next/og`의 `ImageResponse`로 글별 동적 OG(제목·카테고리·ruehanix 브랜딩) 자동 생성.
- **사이트맵/robots**: `app/sitemap.ts`(글·정적 경로), `app/robots.ts`.
- **RSS/Atom**: `app/feed.xml/route.ts`로 피드 제공.
- **구조화 데이터**: 글에 JSON-LD `BlogPosting`(제목·작성자·날짜).
- **정적 생성 + ISR**: 글은 SSG, CMS 웹훅으로 `revalidatePath('/posts/[slug]')` 재검증.
- **사이트 URL**: `NEXT_PUBLIC_SITE_URL`(예: https://ruehan.dev) 환경변수로 canonical/OG 절대경로.

### 5. 점진 이전 순서 (후속 /feature)
1. `entities/post` 소스 인터페이스 + 하드코딩 어댑터로 정규화(동작 동일, 회귀 0).
2. `/posts/[slug]` 라우트 + generateMetadata/StaticParams + JSON-LD.
3. sitemap·robots·RSS·동적 OG.
4. 소스를 Sanity 어댑터로 교체(스튜디오 셋업, 글 마이그레이션).
5. 셸 Reader ↔ 라우트 연결(열람 시 prefetch/딥링크).

## 영향
- 이번 /feature에서는 **계획만** 수립(이 문서). 구현은 위 순서로 분리해 리뷰·롤백을 안전하게.
- 소스 추상화를 먼저 두므로, 콘텐츠 소스 최종 선택이 바뀌어도 라우트·SEO 코드는 재사용된다.
- 환경변수·외부 키(Sanity 토큰 등)는 시크릿이라 가드레일 — 도입 시 사용자 승인/주입 필요.
