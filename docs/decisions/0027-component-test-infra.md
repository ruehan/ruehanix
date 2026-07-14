# 0027. 컴포넌트 단위 테스트 인프라 도입 (happy-dom + Testing Library)

- 상태: 채택
- 날짜: 2026-07-14

## 배경

`lib/ruehanix/`의 모든 순수 로직 모듈은 `.test.ts` 짝을 가져 회귀 방어가 단단하다.
반면 `components/ruehanix/`의 9개 앱(`apps.tsx` 일체)과 셸(`RuehanixShell.tsx`)은
테스트가 0개다. 컴포넌트 단위 검증은 typecheck와 smoke에만 의존한다.

`apps.tsx`를 9개 파일로 분할하면서 동시에 다음과 같은 결함이 들어올 수 있다.

- 앱 내부 throw → 셸 전체 백지(현재 방어 0)
- 분할 중 import 누락으로 빌드는 통과하지만 런타임에 특정 경로에서 throw
- 새 키보드/포커스 동작 추가 시 회귀

이걸 사람이 매번 손으로 확인하기에는 표면이 넓다. 컴포넌트 단위 테스트가 필요하다.

## 결정

`happy-dom` + `@testing-library/react`를 도입하고, vitest 환경을
환경별로 분기한다(파일 위치 기반).

- `lib/**` — 기존처럼 `node` 환경 유지(순수 로직, jsdom 불필요).
- `components/**` — `happy-dom` 환경. 가볍고 jsdom과 API 호환.

추가 의존:

- `happy-dom`
- `@testing-library/react`
- `@testing-library/jest-dom` (matcher)
- `@testing-library/user-event` (상호작용)

`vitest.config.ts`의 `test.environment`를 `happy-dom` 기본으로 두고,
`lib/**`는 per-file `// @vitest-environment node` 코멘트로 오버라이드한다.
또는 `environmentMatchGlobs`로 분기한다 — vitest 2.x는 `environmentMatchGlobs`
대신 `projects` 권장이지만 마이그레이션 비용 ↑. 코드베이스 전반에 `node`가 기본이어야
하므로 **`environment: "node"`를 유지하고 components 파일만 파일 상단 주석으로
오버라이드**한다. 비용 최소.

## 이유와 대안

- **happy-dom** vs jsdom — happy-dom은 더 빠르고 가볍다(2~3배). React 19 + RTL 호환
  문제 없음. 이 프로젝트 규모에서 더 적합.
- **RTL** vs enzyme — enzyme은 React 19 미지원 사실상. RTL이 표준.
- per-file 환경 주석 vs `projects` 분리 — `projects`는 별도 vitest 프로세스 2개.
  CI 시간 2배. 단일 프로세스 + 파일 주석이 가볍다.
- 기존 `node` 환경 유지 — `lib/`의 SSR-safe 순수 로직은 jsdom 노이즈가 끼면 오히려
  디버깅이 힘들다. 현 패턴 보존.

## 영향

- devDeps +4 패키지(약 5MB). node_modules 영향 미미.
- vitest 실행 시 `components/**/*.test.tsx`가 jsdom-like 환경에서 돈다.
  - localStorage·window 등 DOM API 가용. SSR-safe 코드는 그대로 `node` 환경.
- 새 컨벤션: 컴포넌트 테스트는 `*.test.tsx`(tsx). 기존 `*.test.ts`는 그대로.
- apps.tsx 분할 후 각 앱 파일에 최소 1개 smoke 테스트를 둔다.