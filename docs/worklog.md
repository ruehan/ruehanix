# 작업 로그

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
