# 리뷰 기록 — ux-floating G2 (WIP 단계 commit)

- 날짜: 2026-07-15
- 브랜치: feat/ux-floating-g2
- 최종 판정: WIP 단계 commit (다음 세션 완성)
- 검토: 단일 세션에 G2 전체 완성 위험 → 사용자와 "WIP commit + 다음 세션" 합의. 본 라운드 reviewer 호출 생략(자체 검증).

## 변경 요약

- stash `wip:feat/ux-floating G2 carry-over` 복원.
- main 의 visible-기반 children mount (ADR 0038) + Stash 의 floating 토글·드래그·리사이즈 핸들 통합.
- `FloatRect` 타입·WindowState.floating 슬라이스·toggleFloating/setFloatRect stub.
- viewModel 의 6인자 visibleIds 호출 → 5인자 fallback (WIP 부채 정리).
- ADR 0040 (G2 WIP 단계).

## 검증

- typecheck 0 / eslint 0 / vitest 33 files / 245 tests / build 11/11 / smoke 24/24.

## 다음 세션에 필요한 작업 (ADR 0040 명시)

1. useRuehanix dragRef 'float' / 'floatresize' case 동작 검증.
2. viewModel.buildVm 의 tiles 계산 시 floating rect 우선 적용.
3. layout-storage v2 bump — floating 슬라이스 + schema version 2. v1→v2 전체 DEFAULT 폴백 (ADR 0036 정책).
4. toggleFloating / setFloatRect 실동작 + 회귀 테스트.
5. 모바일 (isMobile) 비활성.
6. 키바인딩 (Super+F 등) — ADR 0025 + 사용자 의도.

## 후속 가능 작업

- G2 완료 시 ADR 0025 신설 + ADR 0040 갱신.
- stash drop — `git stash drop stash@{0}` (commit 으로 보존됨).