# 0009. useRuehanix를 React Compiler 친화 패턴으로 재작성

- 상태: 채택
- 날짜: 2026-06-22
- 관련: [[0007-sanity-embedded-studio]]

## 배경

ADR 0007에서 강제된 Next 16 업그레이드로 react-hooks v6(React Compiler 린터)가 동봉됐고,
기존 `useRuehanix`의 명령형 패턴이 신규 규칙 4종을 위반해 eslint.config에서 error→warn으로
완화(12 warn)해 둔 상태였다. 그 빚을 청산한다 — 완화를 제거(규칙을 error로 복귀)해도 통과하도록.

## 결정

`useRuehanix`를 React 19.2 권장 패턴으로 재작성하고 eslint.config의 완화 블록을 삭제한다.

- **외부 상태는 `useSyncExternalStore`로**: 뷰포트 크기(resize)·OS 라이트 선호(matchMedia)·
  시계/리소스(1.4초 틱)를 모듈 스토어 + `useSyncExternalStore`로 구독. effect 내 동기 setState가
  사라지고(`set-state-in-effect` 해소), SSR 스냅샷으로 하이드레이션 안전.
- **`ref` 미러 제거**: 렌더 중 `stRef.current = st` 할당과 `prefersLightRef.current` 읽기를 없앰
  (`refs`·`immutability` 해소). 최신 상태가 필요한 전역 키보드 핸들러는 **`useEffectEvent`** 로 작성.
- **수동 메모이제이션 제거**: 모든 `useCallback`을 제거하고 핸들러를 평범한 함수로
  (`preserve-manual-memoization` 해소). 클릭 핸들러는 매 렌더 생성되며 현재 상태를 직접 읽는다.
- **드래그용 `dragRef`는 유지**: 이벤트 시점에만 변형/접근하므로 렌더 단계 규칙과 무관.
- **부팅 스킵 1줄만 예외**: 마운트 시 브라우저 전용 상태(sessionStorage·reduced-motion)로만
  결정 가능한 "부팅 건너뛰기"의 동기 setState는 `set-state-in-effect`를 라인 단위로 disable +
  사유 명시(렌더/SSR에서 불가). 부팅 진행(interval)·완료(timeout) setState는 비동기라 규칙 무관.

## 이유와 대안

- **완화 유지(대안)** — 그냥 warn으로 두면 빚이 영구화되고 React Compiler 도입 시 막힌다. 기각.
- **React Compiler 활성화(대안)** — `preserve-manual-memoization`은 컴파일러 활성과 무관하게
  컴파일 가능성을 린트한다. useCallback을 제거하면 컴파일러 없이도 경고가 사라진다. 컴파일러
  활성화는 별도 의존(babel-plugin) + 빌드 변경이라 위험을 늘리므로 이번엔 보류(후속 후보).
- **`useEffectEvent`** — React 19.2 안정 API. 전역 리스너가 최신 상태/핸들러를 읽으면서 effect
  재등록을 피하는 정석. ref 미러를 대체.

## 영향
- eslint.config의 react-hooks 완화 블록 제거 → `eslint .` **0 error / 0 warn**(정당한 disable 1줄 제외).
- 동작 불변 확인: verify(typecheck·lint·vitest 48), build, **smoke 16/16**(부팅·타일링·드래그 기반
  레이아웃·런처·테마·독·모바일·검색·a11y·글 라우트). 회귀 없음.
- 후속 후보: React Compiler 정식 활성화(babel-plugin-react-compiler).
