# 작업 로그

## 2026-06-23 — 음악 플레이어 (rhx-play)
- 브랜치: feat/music-player
- 한 일: 데스크톱 셸에 YouTube 기반 음악 플레이어 추가. 2겹 구조 — ①셸 루트 상주 숨긴 iframe 엔진
  (YouTubeEngine, IFrame API로 재생 제어, 비동기 콜백은 useEffectEvent로 최신화) ②항상 보이는 메뉴바
  미니플레이어 ③풀 UI인 `music` 창 앱(MusicApp). 순수 reducer(player.ts: next/prev/select/toggle/volume/
  repeat/onEnded, wrap-around·빈목록 가드)와 영속화(player-storage.ts: 트랙·볼륨·반복모드 복원, playing은
  autoplay 회피로 항상 false)를 엔진과 분리해 단위 테스트. 앱/워크스페이스 전환 시 셸이 언마운트되지 않아
  재생이 끊기지 않음. TRACKS는 사용자 편집용 시드 4곡.
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 68/68), build 성공,
  smoke 3회 연속 21/21(미니플레이어·재생 토글→NOW PLAYING·앱 전환 유지·콘솔 앱 에러 0). 수동(playwright):
  재생 시 youtube embed iframe 생성·MusicApp UI 시각 확인.
- 리뷰: 통과 2라운드(1R P1: 미니플레이어 추가로 메뉴바 중앙 타이틀이 포인터 가로채 smoke flaky →
  focus-title pointerEvents:none·폭 상한; P3 toggle 빈목록 가드) — 상세: docs/reviews/2026-06-23-음악-플레이어.md
- 가정: YouTube IFrame API 채택(자가호스팅 대비 호스팅 0·미디어키 제한 트레이드오프). 재생 지속 범위 =
  셸 내부 전환(공짜). /posts 풀 라우트 이동은 v1 범위 밖(셸 언마운트로 정지). 셔플 미구현(반복만). ADR 0012.
- 백로그: 엔진을 layout.tsx로 올려 크로스 라우트 지속, 셔플, Sanity track 스키마 전환, 비주얼라이저.
- 관련 결정: docs/decisions/0012-music-player.md

## 2026-06-22 — UI 설정 영속화 + 빈 상태 문구 정리
- 브랜치: feat/persist-ui-settings
- 한 일: 셸 UI 설정(테마 모드·accent·gap·rounded·glow·transp)을 localStorage에 영속화해 재접속 복원.
  parseUiState/serializeUiState 순수 함수(검증 포함). 마운트 복원을 부팅 결정과 한 setState로 합쳐
  disable 1줄 유지, [st.ui] 변경 저장(uiSavedRef로 첫 실행 스킵). 빈 상태에서 "/studio 작성" 문구 제거.
- 검증: verify exit 0(typecheck·eslint 0 error/0 warn·vitest 49/49), build OK, smoke 18/18
  (UI 재접속 복원 단언 추가). 시각 확인: 저장 설정이 재로드 후 복원(rh-light + accent 매핑).
- 리뷰: 통과 1라운드(P3 dev StrictMode 관찰 — prod 무영향·수정 불요) — 상세: docs/reviews/2026-06-22-ui-설정-영속화.md
- 가정: 재방문 theme flash는 수용(완전 제거는 백로그). ADR 0011.
- 백로그: theme flash 제거(layout head 인라인 스크립트).
- 관련 결정: docs/decisions/0011-persist-ui-settings.md

## 2026-06-22 — 블로그 글 Sanity 소스 전환 (하드코딩 제거)
- 브랜치: feat/sanity-posts-source
- 한 일: 블로그 글 소스를 하드코딩 → Sanity로 교체("처음부터"). source.ts를 queries(Sanity)로,
  하드코딩 어댑터·POSTS·Post 타입 제거. 셸이 page.tsx 서버 fetch한 글을 props로 받음(ISR 60s),
  식별자 id→slug 전환(slugForId 제거). 글 0개면 Files·Reader·Web·/posts에 "아직 글 없음" 안내.
  posts만 전환(사진·랩타임 유지).
- 검증: verify exit 0(typecheck·eslint 0 error/0 warn·vitest 44/44), build OK(/posts·[slug] SSG),
  smoke 17/17(글-무관 재작성). 빈 데이터셋 빈 상태 시각 확인. /posts 404·sitemap 실측.
- 리뷰: 통과 1라운드(P3: 죽은 Post 타입·INITIAL.selected 정리, 스모크 복원 백로그) — 상세: docs/reviews/2026-06-22-sanity-글-소스-전환.md
- 가정: 단일 소스(Sanity), id→slug 통일, 빌드/스모크의 Sanity 네트워크 의존 수용. ADR 0010.
- 백로그: Portable Text 리치 렌더·동적 OG·사진/랩타임 DB·초안 미리보기·글 렌더 스모크 복원.
- 관련 결정: docs/decisions/0010-sanity-posts-source.md

## 2026-06-22 — useRuehanix React Compiler 리팩터링
- 브랜치: refactor/usereuhanix-react-compiler
- 한 일: useRuehanix를 React 19.2 권장 패턴으로 재작성 — useSyncExternalStore(뷰포트·OS 선호·시계),
  useEffectEvent(키보드), useCallback·ref 미러 전면 제거. eslint.config의 react-hooks v6 완화 4종
  삭제(규칙 error 복귀). 부팅 스킵 1줄만 정당한 disable. 품질 빚(12 warn) 청산.
- 검증: verify EXIT 0(typecheck·eslint 0 error/0 warn·vitest 48/48), build OK, smoke 17/17
  (시계 즉시 시드 단언 추가). 재방문 경로 시계 즉시 표시 수동 확인.
- 리뷰: 통과 2라운드(1R P2: 재방문 시 시계 ~1.4초 "00:00" 회귀 → subscribeSys 즉시 시드 + 스모크 박제) — 상세: docs/reviews/2026-06-22-usereuhanix-react-compiler.md
- 가정: React Compiler 정식 활성화는 보류(useCallback 제거로 경고는 이미 해소). 후속 후보.
- 백로그: reboot 타이머 정리(선존·비회귀), React Compiler babel-plugin 활성화.
- 관련 결정: docs/decisions/0009-usereuhanix-react-compiler-refactor.md

## 2026-06-22 — 글 라우트(/posts) + SEO
- 브랜치: feat/posts-routes-seo
- 한 일: 콘텐츠 소스 추상화(source.ts 단일 진입점=하드코딩 어댑터, BlogPost.body 문단 통일,
  영문 slug·ISO 발행일) + `/posts/[slug]`(RSC·SSG·generateMetadata·JSON-LD BlogPosting)·`/posts`(목록)
  + sitemap·robots(/studio 차단)·RSS(feed.xml). 셸 Reader에 "전체 페이지로 보기" 링크.
  Sanity CORS 대기라 하드코딩 소스로 먼저 완성(나중 어댑터 한 줄 교체).
- 검증: verify EXIT 0(typecheck·lint 0 error/12 warn·vitest 48/48), build(/posts·[slug] SSG 8글·
  sitemap·robots·feed 생성), smoke 16/16(글 라우트·sitemap 시나리오 추가). curl로 메타·sitemap·RSS 확인.
- 리뷰: 통과 1라운드(P3: slugForId source 경유·RSS 빈 발행일 가드) — 상세: docs/reviews/2026-06-22-글라우트-seo.md
- 가정: slug 영문 수동(한글 제목→slug 모호함 회피), body 문단 배열 통일. ADR 0008.
- 백로그: 하드코딩→Sanity 어댑터 교체(CORS 후), Portable Text 리치 렌더, 글별 동적 OG, 카테고리 필터.
- 관련 결정: docs/decisions/0008-post-routes-and-seo.md

## 2026-06-22 — Sanity 임베드 스튜디오 (+ 강제 Next 16 업그레이드)
- 브랜치: feat/sanity-embedded-studio
- 한 일: `/studio` 임베드 Sanity 스튜디오(클라이언트 전용 ssr:false) + post 스키마 +
  env 클라이언트(읽기토큰 서버 전용) + post 정규화·GROQ 어댑터(normalizePost 순수 TDD).
  Sanity 6/next-sanity 13 호환 위해 react 19.2·**Next 16(major)** 강제 업그레이드, next lint 제거로
  ESLint flat config 이전, react-hooks v6 신규 규칙 4종 warn 완화. `.env*` gitignore + `.env.example`.
- 검증: verify exit 0(typecheck·lint 0 error/12 warn·vitest 38/38), 빌드 OK(/studio=ƒ),
  smoke 14/14(Next 16에서 앱 회귀 없음). /studio mount·프로젝트 접속 확인(CORS는 포트 미등록 환경 이슈).
- 리뷰: 통과 1라운드(P2: formatDate UTC 고정·readToken 백로그 주석; P3: ADR 보강·.env.example·cover 백로그) — 상세: docs/reviews/2026-06-22-sanity-임베드-스튜디오.md
- 시크릿 안전: 토큰값이 git·클라이언트 번들 어디에도 없음(리뷰어 스캔 확인).
- 백로그: /posts/[slug]·sitemap·RSS·동적 OG·8글 마이그레이션(ADR 0006 순서), readToken 배선,
  cover 매핑, useRuehanix react-compiler 리팩터링.
- 관련 결정: docs/decisions/0007-sanity-embedded-studio.md

## 2026-06-22 — 완성도 패스(메타·부팅·검색·접근성) + 콘텐츠/SEO 계획
- 브랜치: feat/polish-and-content-plan
- 한 일: (1) 메타데이터 확장·9-dot favicon·터미널 스타일 404·브랜딩 OG 이미지(next/og).
  (2) 부팅 세션 1회(sessionStorage)+prefers-reduced-motion 건너뜀. (3) 런처 실제 검색
  (filterApps·Enter 첫 결과·결과없음·query 초기화). (4) 핵심+콘텐츠 클릭 요소 키보드 접근성
  (clickable: role/tabIndex/Enter·Space/aria-label), :focus-visible, reduced-motion 애니 비활성.
  (5) 콘텐츠 관리·SEO 운영 계획 ADR 수립(구현은 후속 분리).
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 32/32), build 5/5(og·icon·404),
  smoke 14/14(검색 필터·a11y role·부팅 1회 시나리오 추가).
- 리뷰: 통과 1라운드(P2: summary_large_image인데 og:image 없음 → 브랜딩 OG 이미지 추가) — 상세: docs/reviews/2026-06-22-완성도패스-접근성-계획.md
- 가정: 콘텐츠/SEO는 계획만, 구현은 후속. gap 슬라이더 키보드 미지원은 비차단(나머지 설정은 접근 가능).
- 백로그: 콘텐츠 소스(Sanity 등) 도입+/posts/[slug]+sitemap/RSS/동적 OG(ADR 0006 순서), 슬라이더 키보드.
- 관련 결정: docs/decisions/0006-content-seo-strategy.md

## 2026-06-22 — 첫 방문 힌트 제거 · 독 호버 이름 라벨
- 브랜치: feat/dock-tooltip-remove-hint
- 한 일: 사용자 피드백 반영 2건. (1) 첫 방문 힌트(튜토리얼 말풍선) 완전 제거 — AppsHint·hint 상태/
  9초 타이머/localStorage·onboarding 로직·rh-pulse 삭제. (2) 데스크톱 독 아이콘 호버 시 위에 앱 이름
  라벨 표시(순수 CSS, .rh-dock-label). title→aria-label. 독·버튼 강화는 유지.
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 22/22), build 4/4, smoke 11/11(호버 라벨 가시성
  히트테스트 시나리오 포함).
- 리뷰: 통과 2라운드(1R P1: 호버 라벨이 overflowX 클리핑으로 안 보임 → overflowX/maxWidth 제거+
  z-index, 스모크를 elementFromPoint 가시성 검사로 강화; P3 라벨색 var(--text)) — 상세: docs/reviews/2026-06-22-힌트제거-독호버라벨.md
- 가정: 호버 표시는 순수 CSS(:hover)로, React state 불필요. ADR 0005(0004 힌트 부분 폐기).
- 관련 결정: docs/decisions/0005-remove-hint-dock-tooltip.md

## 2026-06-22 — 앱 발견성 (데스크톱 독·버튼 강화·첫 방문 힌트)
- 브랜치: feat/app-discoverability
- 한 일: 데스크톱(≥768) 앱 실행 발견성 3종. (1) 하단 중앙 floating 독 — 8앱 클릭 실행·활성 강조·호버,
  타일 영역에 독 자리 확보(area bottomReserve). (2) 좌상단 런처 버튼을 9-dot 앱그리드 아이콘 +
  툴팁 + 호버로 강화. (3) 첫 방문 시 독 위 펄스 말풍선 힌트 — localStorage 1회, 9초/클릭 시 닫힘.
  표시 게이팅(shouldShowHint)·area reserve는 순수 함수로 분리해 vitest.
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 26/26), build 4/4(/ 18.1kB),
  smoke 10/10(데스크톱 독 시나리오 추가). Playwright 시각 확인(독·버튼·힌트 렌더).
- 리뷰: 통과 1라운드(P3: 타이머 cleanup 반영, a11y 백로그) — 상세: docs/reviews/2026-06-22-앱발견성.md
- 가정: 세 기능 모두 데스크톱 한정, 모바일 무변경. 버튼 라벨 "ruehanix" 유지(아이콘만 교체). ADR 0004 기록.
- 백로그: 클릭 요소 전반 키보드 접근성(div+onClick → role/tabIndex/Enter), 독 자동숨김 토글, 힌트 다국어.
- 관련 결정: docs/decisions/0004-app-discoverability.md

## 2026-06-22 — 반응형 / 모바일 모드
- 브랜치: feat/responsive-mobile
- 한 일: RueHanix에 768px 경계 반응형 추가. <768px에서 폰 OS 메타포(포커스 앱 풀스크린 +
  하단 독 8앱 전환 + 상단바 간소화 + 홈 아바타 카드)로 전환, 데스크톱 위젯·런처·키바인드·
  드래그 거터·Super 단축키 비활성. ≥768px 타일링 WM은 무변경. 순수 로직(isMobileWidth·
  mobileAppRect)을 lib로 분리해 vitest 테스트.
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 21/21), build 4/4(/ 17.5kB),
  smoke 8/8(모바일 독 전환 시나리오 포함). Playwright 시각 확인(390x844) 정상.
- 리뷰: 통과 1라운드(P3 보완: 기록·모바일 키보드 가드·음수높이 방어) — 상세: docs/reviews/2026-06-22-반응형-모바일.md
- 가정: 단일 경계 768px, 폭 기준 판정(포인터 무관) — 사용자 선택, ADR 0003 기록.
- 백로그: 모바일 스와이프 제스처, safe-area-inset, 독 길게 눌러 닫기.
- 관련 결정: docs/decisions/0003-responsive-mobile-strategy.md

## 2026-06-22 — RueHanix Next.js 변환
- 브랜치: feat/nextjs-conversion
- 한 일: 단일 `index.html`(React CDN, ADR 0001)을 Next.js 15 App Router + TypeScript로 변환.
  App 클래스를 `useRuehanix` 훅 + `viewModel.ts` 순수 빌더로 재작성, 8개 앱·waybar·타일링 WM·
  드래그·런처·키보드 단축키·라이브 테마 엔진을 함수형+훅으로 이식. 타일링/테마 로직을
  `lib/ruehanix`의 순수 함수로 분리(vitest 16개). 스타일은 globals.css + 인라인 객체.
  기능·UI·스타일 원본과 동치(시각 확인 포함).
- 검증: verify.sh 통과(typecheck·lint 무경고·vitest 16/16), `npm run build` 정적 프리렌더 4/4,
  `npm run smoke` 6/6.
- 리뷰: 통과 1라운드(병합 전 기록 보완) — 상세: docs/reviews/2026-06-22-nextjs-변환.md
- 가정: 구조는 사용자 선택대로 실용적 분해(풀 FSD 아님) — ADR 0002로 예외 기록.
  index.html은 참조용 보관(미삭제).
- 백로그(비차단): smoke에 키보드 단축키·드래그 거터 시나리오 추가, index.html 제거,
  콘텐츠 MDX/CMS 분리, 접근성(div→role/키보드).
- 관련 결정: docs/decisions/0002-nextjs-conversion.md

## 2026-06-22 — ruehanix 데스크톱 셸 구현
- 브랜치: feat/ruehanix-desktop
- 한 일: Claude Design 프로토타입 `RueHanix.dc.html`(Design Composer 런타임 의존, 단독 실행 불가)을
  빌드툴 없는 단일 `index.html`로 포팅. React(CDN)+Babel standalone. 부팅 시퀀스, waybar, 타일링 WM +
  드래그 거터, 앱 런처, 키보드 단축키, 라이브 테마 엔진(light/dark/auto·accent·gap·투명도·라운드·glow),
  6 워크스페이스, 8개 앱(Files/Reader/Foto/HotLap/Terminal/Web/Settings/About).
  재현 가능한 Playwright 스모크(`scripts/smoke.mjs`, `npm run smoke`) 추가.
- 검증: `npm run smoke` 6/6 통과 (boot·waybar·ws2 타일링·런처 앱 오픈·Light 테마·콘솔 앱 에러 0).
  verify.sh는 HARNESS GAP(빌드툴 없는 정적 HTML) — ADR 0001로 사유 문서화, 스모크로 센서 대체.
- 리뷰: 통과 2라운드 (1라운드 수정 필요: 기록물 누락·스모크 재현불가·P3 3건) — 상세: docs/reviews/2026-06-22-ruehanix-데스크톱-셸.md
- 가정: 사용자가 "지금은 HTML, 이후 React/Next 변환"으로 범위 지정 → FSD 대신 단일 HTML 채택.
  콘텐츠(블로그 글·랩타임·사진)는 원본대로 하드코딩, 백엔드 없음.
- 백로그(React/Next 전환 시): 접근성(div onClick → role/tabIndex/키보드), Babel 런타임 트랜스파일 제거,
  FSD 슬라이스 분해, `S()` 인라인 스타일 → CSS 모듈.
- 관련 결정: docs/decisions/0001-html-first-implementation.md
