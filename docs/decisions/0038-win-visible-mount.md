# 0038. Win visible-기반 children mount

- 상태: 채택
- 날짜: 2026-07-14

## 배경

ADR 0033 의 셸 앱 5개 dynamic import (실제로는 3개로 좁힘) 는 chunk 그래프
분리만 했지 진짜 lazy 효과는 없었다 — 9개 `<Win>` 이 항상 마운트되어
dynamic wrapper 도 즉시 마운트 → chunk 즉시 요청. 라운드 측정에서 표면 delta
+1.6KB / 앱 코드만 +11.7KB 의 *증가*. 후속 작업으로 visible-기반 mount 명시.

## 결정

`Win` 의 `vm.tiles[app]` 가 `display: "none"` 이면 chrome + children 미렌더.
visible 일 때만 마운트.

- `lib/ruehanix/win-visibility.ts` (신설) — `isHidden(style)` 헬퍼. `display: "none"` 만 hidden 으로.
- `Win` 컴포넌트 inline 수정 — `hidden` 이면 `<div style={tileStyle} aria-hidden />` 만.
  아니면 기존 chrome + ErrorBoundary + `{children}` 그대로.
- dynamic loader 가 chunk 캐시 → minimize/restore 시 즉시 재로드.

## 사용한 패턴 회피 (ADR 0038 작성 중 검토한 대안)

- **useState + useEffect `setHasMounted(true)`** — React 19 의 "Calling setState
  synchronously within an effect can trigger cascading renders" lint 회피 불가.
  useLayoutEffect 도 동일. useState 만 cascade 회피는 외부 시스템 sync 가 아닌
  use case 에 부적합.
- **useRef 직접 변경** — `if (!hidden) ref.current = true` — "Cannot access refs
  during render" lint 회피 불가.
- **useSyncExternalStore** — 외부 스토어가 아닌 internal state 에는 과한 추상화.

채택 패턴: visible 토글에 따라 children 을 자연스럽게 mount/unmount. dynamic
loader 캐시로 chunk 즉시 재로드. local state (스크롤 위치·검색어 등) 가
minimize/restore 시 reset — minimize 가 명시적 pause 의 성격이므로 reset 이
의도와 부합. 음악 재생은 player 스토어 외부 state 라 영향 없음.

## 영향

- 초기 진입 시 visibleIds 가 비어있어 모든 Win 의 children 미마운트. dynamic
  chunk 도 로드 안 됨.
- 첫 open 시점 (런처/독 클릭) 에만 dynamic chunk 다운로드. 가시 시점 lazy.
- minimize → 다른 ws → ws 복귀 시 children 재마운트 (chunk 캐시로 즉시).
- ADR 0033 의 magnitude 정정 가능 — chunk 분리 + visible 게이팅이 결합되어
  비로소 "dynamic 3앱이 정말 가시 시점에만 로드" 실현.

## 후속 작업

- 마운트/언마운트 메트릭 측정. chunk 그래프 + gzipped delta 재측정.
- 단위 테스트 (Win 컴포넌트) — happy-dom + RTL.
- `lib/ruehanix/win-visibility.ts` 외에 9개 dynamic 모두를 lazy init 으로 일관?