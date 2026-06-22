# 작업 로그

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
