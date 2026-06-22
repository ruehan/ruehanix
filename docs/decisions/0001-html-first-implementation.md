# 0001. RueHanix를 빌드툴 없는 단일 정적 HTML로 먼저 구현

- 상태: 채택
- 날짜: 2026-06-22

## 배경

Claude Design 프로젝트의 `RueHanix.dc.html`를 실제로 구현하는 작업이다.
원본은 Design Composer 런타임(`<x-dc>`, `DCLogic`, `sc-for`/`sc-if`, `{{ }}` 바인딩)에 의존해
브라우저에서 단독 실행되지 않는다. 디자인 자체는 React 스타일 클래스 컴포넌트
(`this.state`/`setState`, 라이프사이클, `React.createElement`)로 작성돼 있다.

제로원 프론트엔드 표준은 React/TypeScript + FSD다. 다만 사용자는 "지금은 HTML로 두고,
이후 React/Next.js로 변환 예정"이라고 범위를 정했다.

## 결정

빌드툴·번들러·패키지 매니저 없이 **단일 `index.html`** 로 구현한다.
- React 18 + ReactDOM + Babel standalone을 CDN(unpkg)으로 로드한다.
- 원본의 상태/핸들러 로직(`renderVals`, 레이아웃 계산, 부팅 시퀀스, 테마 엔진)은
  거의 그대로 옮긴다. `extends DCLogic` → `extends React.Component`만 교체.
- `<x-dc>` 선언형 템플릿은 실제 `render()`의 JSX로 번역한다
  (`{{x}}`→`{x}`, `sc-for`→`.map`, `sc-if`→`&&`).
- 템플릿이 CSS 문자열로 넘기는 스타일은 `S(cssText)` 헬퍼로 React style 객체로 변환한다.
- `style-hover`(Design Composer 전용)는 CSS 클래스(`:hover`)로 대체한다.

## 이유와 대안

- **Vite/Next + FSD (표준 풀스택)** — 표준엔 가장 부합하나 사용자가 "지금은 HTML"로 범위를
  좁혔다. 지금 도입하면 폐기 비용이 큰 셋업이 된다. 기각.
- **순수 바닐라 JS 재작성** — CDN 의존을 없애지만 원본 로직을 통째로 다시 써야 해
  버그 위험이 크고, "이후 React 변환"과도 방향이 어긋난다. 기각.
- **채택안: React(CDN) 단일 HTML** — 원본 로직을 최소 수정으로 재사용해 동작 충실도가 높고,
  클래스 컴포넌트가 이미 실제 React 컴포넌트라 이후 Vite/Next 프로젝트로 들어올리기 쉽다.
  HTML-first 요구와 표준 수렴 양쪽을 다리 놓는다.

## 영향

- 런타임에 Babel가 브라우저에서 트랜스파일한다 → 콘솔 경고 1개(프로덕션 사전컴파일 권고)와
  초기 페인트 지연이 있다. 프로토타입 단계에선 수용한다. 변환 시 사라진다.
- 빌드 파이프라인이 없어 verify.sh 기반 단위 테스트 대신 **브라우저 스모크 검증**으로 센서를 둔다
  (부팅 완료, 창 타일링, 런처, 앱 오픈, 라이브 테마 전환, 콘솔 앱 에러 0).
- 콘텐츠(블로그 글·랩타임·사진)는 원본대로 컴포넌트에 하드코딩한다. 백엔드 없음.
- 향후 React/Next 전환 시: `App` 클래스의 `bodyXxx`/`win`/`render`를 함수 컴포넌트·FSD
  슬라이스로 분해하고, `S()` 인라인 스타일을 CSS 모듈/styled로 옮기는 게 다음 단계다.
