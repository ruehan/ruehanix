# 0007. Sanity 임베드 스튜디오 도입 (+ 강제된 Next 16 업그레이드)

- 상태: 채택
- 날짜: 2026-06-22
- 관련: [[0006-content-seo-strategy]]

## 배경

ADR 0006에서 콘텐츠 소스로 Sanity를 추천했고, 사용자가 "임베드"를 선택해 값(projectId·dataset·
읽기 토큰)을 `.env.local`에 넣어 전달했다. Next 레포 안 `/studio`로 스튜디오를 임베드한다.

## 결정

### 1. 임베드 스튜디오
- `sanity.config.ts`(defineConfig·structureTool·visionTool·post 스키마) + `app/studio/[[...tool]]/`.
- 스튜디오는 **클라이언트 전용**으로 렌더한다: `page.tsx`에서 `next/dynamic({ ssr: false })`로
  `Studio.tsx`(NextStudio)를 불러온다. Sanity 플러그인이 빌드 시 서버에서 평가되면
  `createContext is not a function`으로 깨지기 때문(서버 React에 일부 API 부재).
- 스키마: post(title·slug·category·publishedAt·excerpt·readingTime·cover·body=Portable Text).

### 2. 소스 추상화 + 정규화
- `lib/posts`에 정규화 타입(BlogPost)·`normalizePost`(순수, vitest)·GROQ 어댑터(getAllPosts/
  getPost/getSlugs). 소스가 바뀌어도 BlogPost 형태는 유지(ADR 0006의 추상화).

### 3. 시크릿 처리
- `.env.local`은 gitignore(이번에 `.env*` 규칙 추가). 읽기 토큰은 서버 전용(`SANITY_API_READ_TOKEN`),
  클라이언트 번들 노출 금지. projectId·dataset은 공개값이라 `NEXT_PUBLIC_*`.

### 4. 강제된 의존성 업그레이드 (중요 트레이드오프)
현재 Sanity(latest 6.1)와 next-sanity 13이 **React 19.2의 `useEffectEvent`** 를 요구한다.
이를 webpack/turbopack이 해석하려면 **Next 16**이 필요했다. 연쇄적으로:
- `react`/`react-dom` 19.0 → **19.2**.
- `next` 15.5 → **16.2** (major). next-sanity 13·@sanity/visual-editing이 next≥16 peer를 요구.
- Next 16이 `next lint`를 제거 → **ESLint flat config**(`eslint.config.mjs`, `eslint-config-next/
  core-web-vitals`)로 마이그레이션, `.eslintrc.json` 삭제, lint 스크립트 `eslint .`.
- Next 16 동봉 **react-hooks v6(React Compiler 린터)** 가 기존 `useRuehanix`의 의도된 패턴
  (이벤트 핸들러용 ref 미러, 수동 useCallback, 부팅 게이트의 effect 내 setState)을 error로 막음 →
  해당 신규 규칙 4종(refs·immutability·preserve-manual-memoization·set-state-in-effect)을
  **warn으로 완화**. 후속으로 useRuehanix를 React Compiler 친화적으로 리팩터링한다.

## 이유와 대안

- **Sanity 다운그레이드로 Next 15 유지(대안)** — 검토했으나, 현행 Sanity(6)/next-sanity(13)는
  React 19.2/Next 16과 커플링돼 있고, 구버전 Sanity(3.x)는 React 19를 지원하지 않아 React 19 앱과
  충돌. 즉 "현행 Sanity = 현행 스택"이 사실상 강제라 Next 16이 불가피. 기각.
- **ssr:false 동적 임포트** — 스튜디오 SSR 평가 깨짐을 피하는 표준 탈출구. 스튜디오는 관리 도구라
  SEO·SSR 불필요해 손해 없음.
- **react-hooks 신규 규칙 완화(warn)** — 기존 코드는 이미 리뷰·검증을 통과한 정상 동작 코드다.
  강제된 toolchain 업그레이드로 새로 들어온 opinionated 규칙을 한 작업에서 전면 수용하면 범위가
  폭발한다. error→warn으로 가시성은 유지하되 차단하지 않고, 전용 후속 작업으로 분리.

## 영향
- 앱 전체가 Next 16 위에서 동작(검증: verify 통과·smoke 14/14로 회귀 없음 확인).
- 스튜디오는 `/studio`에서 동작하며, Sanity **CORS origins**에 접속 도메인(localhost:3000 등)이
  등록돼야 로그인 화면이 뜬다(미등록 시 CorsOriginError). 배포 도메인도 등록 필요.
- 다음 단계(ADR 0006 순서): `/posts/[slug]` 라우트·sitemap·RSS·동적 OG, 하드코딩 8글 마이그레이션,
  셸 Reader ↔ Sanity 연결. **useRuehanix react-compiler 리팩터링**도 백로그.
