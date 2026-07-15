# 리뷰 기록 — Win visible-기반 children mount

- 날짜: 2026-07-15
- 브랜치: feat/win-visible-mount
- 최종 판정: 통과 (2라운드)

## 1라운드

- 판정: 수정 필요 (P1 2건 + P2 + P3)
- 검증: typecheck 0 / eslint 0 / vitest 33 files / 245 tests (isHidden 4/4) / build 11/11 / smoke 24/24

### 지적사항

- [P1] commit message 의 "정적 5개는 unmount 안 됨" 사실 오류 — 코드와 어긋남. 9개 Win 모두 동일 게이트.
- [P1] `FotoApp` 회귀 — ws 전환 시 폴더 view·라이트박스 local state reset. 흔한 시나리오.
- [P2] `Win` 컴포넌트 단위 테스트 부재 (후속으로 미룸).
- [P3] worklog/review 미동반 (의도적 분리).

### 반영

- `Win` 에 `preserveLocalState?: boolean` prop 추가. FotoApp 한 곳만 `true`.
- ADR 0038 `preserveLocalState` 섹션 추가.

커밋: `55480e7 fix(shell): 리뷰 라운드1 P1-2 반영 — preserveLocalState + ADR 보강` (amend)

## 2라운드

- 판정: 수정 필요 (P1 minor 2건)
- 검증: 동일 — 모두 통과.

### 지적사항

- [P1] 커밋 메시지 P2 언급했으나 미반영. 정정.
- [P1] `preserveLocalState` close 케이스 의도 미명시. ADR에 "close → reopen 시 local state 유지" 한 줄.

### 반영

- 커밋 amend 로 메시지 정정.
- ADR 0038 "close 케이스 의도" 단락 추가.

## 후속 가능 작업

- Win 컴포넌트 단위 테스트 (P2).
- Win 컴포넌트 컴포넌트 테스트 보강.
- 사진·음악 ws 전환 시 동적 3개 chunk 즉시 재로드의 실제 비용 측정.