# 0002. RueHanix를 Next.js(App Router)로 변환

- 상태: 채택
- 날짜: 2026-06-22
- 관련: [[0001-html-first-implementation]] (대체하지 않고 발전)

## 배경

ADR 0001에서 RueHanix를 빌드툴 없는 단일 `index.html`(React CDN + Babel)로 구현했고,
"이후 React/Next 전환"을 백로그로 남겼다. 이번 작업은 그 전환이다.
요구: 기능·UI·스타일을 그대로 유지하면서 Next.js 프로젝트로 옮긴다.

사용자가 진행 전 4개 선택을 확정했다: 레포 루트 / 실용적 구조 / 함수형+훅 / globals.css+인라인 객체.

## 결정

1. **Next.js 15 App Router + TypeScript**, 레포 루트에 배치.
2. **구조는 실용적 분해** (`app/`, `components/ruehanix/`, `lib/ruehanix/`).
   FSD의 pages/widgets/features 슬라이스로 강제 분해하지 않는다.
3. **함수형 컴포넌트 + 훅**: 원본 `App` 클래스를 `useRuehanix` 커스텀 훅(상태·핸들러·이펙트)으로 재작성.
   파생 뷰모델은 `viewModel.ts`의 순수 빌더로 분리.
4. **스타일**: CSS 변수·keyframes·hover는 `app/globals.css`, 나머지는 React style 객체.
   원본의 `S(cssString)` 런타임 파서 제거.
5. **순수 로직 분리 + TDD**: 타일링 레이아웃(`layout.ts`)·테마 계산(`theme.ts`)을 순수 함수로 떼어
   vitest로 단위 테스트(16개). 인터랙션은 Playwright 스모크로 검증.
6. **검증 센서**: `npm run typecheck|lint|test`(verify.sh가 자동 감지) + `npm run smoke`.
7. 기존 `index.html`은 참조용으로 **보관**(추후 정리). next-env.d.ts·.next는 gitignore.

## 이유와 대안

- **풀 FSD 분해(대안)** — CONVENTIONS의 기본값이나, RueHanix는 창 드래그·키보드·라이브 테마가
  한 덩어리로 묶인 **단일 인터랙티브 셸**이다. 도메인 슬라이스(pages/widgets/features)로 쪼개면
  인위적 경계가 생기고 결합도만 흐려진다. CONVENTIONS의 FSD는 "다중 비즈니스 도메인" 가정이라
  이 케이스엔 부적합 → 실용적 분해를 택하고 이 ADR로 예외를 기록한다.
- **클래스 컴포넌트 유지(대안)** — 저위험이나 비표준. 사용자가 현대화를 택했고, 원본 로직이
  setState/라이프사이클 기반이라 훅 매핑이 명확해 위험이 관리 가능하다고 판단.
- **CSS Modules 전면 전환(대안)** — 가장 표준적이나 수백 개 인라인 스타일 이전은 충실도 회귀
  위험이 크고 시간이 많이 든다. "그대로 구현" 요구에 반한다. 인라인 객체 유지로 1:1 이식.
- **next/font(대안)** — 빌드 타임 폰트 페치가 제한 환경에서 실패할 수 있어, 원본과 동일한
  Google Fonts `<link>` 런타임 로드를 유지. App Router 오탐 린트는 라인 단위로 사유와 함께 비활성화.

## 영향

- 빌드 파이프라인이 생겨 verify.sh가 실질 센서가 됨(HARNESS GAP 해소). 정적 프리렌더 + CSR 하이브리드.
- 하이드레이션 안전: 초기 상태에 `window`/`Date`/`Math.random`을 쓰지 않고 마운트 이펙트에서 채움.
  (부팅 오버레이가 초기 화면을 덮어 시각적 깜빡임 없음.)
- 향후: index.html 제거, 콘텐츠를 MDX/CMS로 분리, 접근성(div→role/키보드) 개선이 다음 후보.
