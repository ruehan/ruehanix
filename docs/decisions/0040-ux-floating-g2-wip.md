# 0040. ux-floating G2 (WIP 단계 commit)

- 상태: WIP → 완료 (ADR 0025 본문으로 이관, ADR 0025 신설)
- 날짜: 2026-07-15

## 배경

`feat/ux-floating` G2 — floating windows (Hyprland floating 동등). 사용자가
타일 레이아웃에서 벗어나 자유 위치/크기로 창을 띄울 수 있게. ADR 0025 의 G2
단계. stash `wip:feat/ux-floating G2 carry-over` 가 보존돼 있었음.

## 이번 세션의 범위 (WIP commit)

단일 세션에 G2 전체 완성(드래그·리사이즈·storage v2) 은 깊이 + 시간 둘 다
부족. 이번 세션의 결정은 "WIP commit + 다음 세션 완성" — 사용자의
"복원 + 완성" 의도 중 **복원** 만 즉시, **완성** 은 다음 세션.

### 이번에 적용

- `lib/ruehanix/types.ts` — `FloatRect` 추가.
- `lib/ruehanix/windowState.ts` — `WindowState.floating` 추가, `toggleFloating` /
  `setFloatRect` stub. `visible` / `visibleIds` signature 변경 없음.
- `lib/ruehanix/windowState.test.ts` — fixture `S` 에 `floating: {}` 추가.
- `components/ruehanix/RuehanixShell.tsx` — main 의 visible-기반 children mount
  + Stash 의 floating 토글 버튼 / startFloatDrag·Resize / 모서리 리사이즈 핸들
  통합. conflict 해결.
- `components/ruehanix/viewModel.ts` — WIP 의 `visibleIds` 6인자 호출을 5인자로
  fallback (현재 visibleIds 정의와 정합). floating rect 적용은 다음 세션.

### 다음 세션에 필요한 작업

- `useRuehanix` 의 dragRef float/floatresize case 동작 (WIP 에 핸들러 존재,
  검증 필요).
- `viewModel.buildVm` 의 tiles 계산 시 floating rect 우선 적용 — floating
  앱은 computeLayout 결과 대신 `floating[k]` 직접 사용.
- `layout-storage` v2 bump — `floating` 슬라이스 추가 + schema version 2.
  v1→v2 마이그레이션 정책 (ADR 0036 정한 대로 전체 DEFAULT 폴백).
- `toggleFloating` / `setFloatRect` 실동작 + 회귀 테스트.
- 모바일 (`isMobile`) 분기 — floating 비활성. desktop 한정.
- 키바인딩 (Super+F 등) — ADR 0025 + 사용자 의도.

## 영향

- 빌드/테스트 모두 green. 기능적으로는 floating 토글 버튼이 보이지만 동작
  미완성 (stub). 사용자 시연에서 의도된 UI 가 작동하지 않을 수 있음.
- 기존 visible-기반 children mount + layout 영속화(v1)는 그대로 동작.

## 후속 작업

- 위 "다음 세션에 필요한 작업" 전체.
- 완료 시 ADR 0025 신설 (floating 전체 결정 기록) + ADR 0040 갱신 (완료).