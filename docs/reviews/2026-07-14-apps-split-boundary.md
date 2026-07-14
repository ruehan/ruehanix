# 리뷰 기록 — apps.tsx 분리 + AppErrorBoundary

- 날짜: 2026-07-14
- 브랜치: feat/apps-split-boundary
- 최종 판정: 통과 (2라운드)

## 1라운드

- 판정: 수정 필요
- 검증: typecheck 0 / eslint 0 / vitest 24 lib suites + AppErrorBoundary 4 통과 / build 성공 / smoke 24/24

### 지적사항

- [P1] `components/ruehanix/AppErrorBoundary.tsx:70` — `var(--surface0)` 는 globals.css 에 정의되지 않음(실재: `--surf0/--surf1/--surf2`). 투명 폴백으로 버튼 배경 소실. 같은 줄 71번의 `var(--surf0)` border 와 모순.
- [P2] `components/ruehanix/AppErrorBoundary.tsx:36-38` — `setState` 직후 `onRetry` 호출 순서. onRetry 가 children 을 재throw 상태로 만드는 경계에서 직관에 반함. 부모 정리 먼저 → setState 순서가 자연스러움.
- [P2] `components/ruehanix/AppErrorBoundary.tsx:40-79` — fallback 컨테이너에 focus 이동 부재. 키보드 사용자가 "다시 시도" 버튼까지 Tab 탐색 필요.
- [P3] `components/ruehanix/AppErrorBoundary.test.tsx` — 엣지 케이스(onRetry 미지정 / 연속 throw / null children) 누락.
- [P3] `components/ruehanix/apps.tsx:1-3` — 배럴 환원 시 named-export-only 단서 부족.

### 반영

- P1: `var(--surface0)` → `var(--surf0)`, border `var(--surf0)` → `var(--surf1)`. SettingsApp.tsx:211 의 surf0 bg + surf1 border 패턴과 시각 정합.
- P2 retry 순서: `this.props.onRetry?.()` 먼저 → `this.setState({ error: null })`. 주석으로 cleanup → restore 의도 명시.
- P2 focus: `private alertRef = createRef<HTMLDivElement>()`, `componentDidCatch` 에서 `this.alertRef.current?.focus()`. fallback `<div>` 에 `ref={this.alertRef}` + `tabIndex={-1}` + `outline: "none"` 부여. 키보드 사용자는 즉시 헤딩 위치를 인지하고 Tab 으로 버튼 도달.
- P3 테스트 3 케이스 추가 — onRetry 미지정 시 retry 동작, 연속 throw catch, null children 렌더. (총 4 → 7)
- P3 apps.tsx 배럴 주석 — "default export 금지, named export only" 단서 한 줄.

커밋: `9fd5269 fix(shell): 리뷰 라운드1 반영 — CSS 변수 오타·focus·retry 순서·테스트 보강`

## 2라운드

- 판정: 통과
- 검증: vitest 25 files / 206 tests (AppErrorBoundary 7/7) / build 성공 / smoke 24/24

### 신규 결함

없음. 라운드 1 지적 모두 의도대로 반영됨. globals.css:2,7 에 `--surf0` 양 테마 정의 확인, SettingsApp.tsx 와 시각 정합. ref 안전성 / unmounted setState (React 19 silent) 검토 OK.

### 보강 제안 (다음 작업용, 이번엔 미반영)

- [P3] `AppErrorBoundary.test.tsx:117-124` — `expect(container).toBeInTheDocument()` 는 자명. `expect(container.firstChild).toBeNull()` 또는 `expect(container.innerHTML).toBe("")` 가 "null children 이 실제로 경계 내부에서 빈 렌더" 의도 전달이 더 강함.
- [P3] `AppErrorBoundary.test.tsx:100-115` — 연속 throw 케이스가 fallback persistence 만 확인. "throw → recover(setState) → 재throw → 재catch" 풀사이클은 미커버. 8번째 케이스로 보강 가치 있음.

위 두 건은 통과 판정 기준선 미달이 아니므로 차기 작업(컴포넌트 테스트 인프라 확장 시)에 반영.