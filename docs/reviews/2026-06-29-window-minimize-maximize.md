# 리뷰 기록 — 창 관리(최소화/최대화)
- 날짜: 2026-06-29
- 브랜치: feat/ux-window-minmax
- 최종 판정: 통과 (2라운드)

## 개요
9개 UX 피처 중 마지막(창 계열 I). 순수 visibleIds(layout.ts, 최소화 제외·최대화 단일) + CoreState
minimized/maximized + 핸들러(minimize/toggleMaximize, openApp/openPost unminimize+maximized 정리) +
타이틀바 —/□/✕ 버튼 + 더블클릭 최대화. 신규 ADR 0023.

## 1라운드
- 판정: 수정 필요
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 162/162), build 성공, smoke 23/23.
- 지적사항:
  - [P1] openPost가 openApp의 unminimize/maximized 정리를 우회 — Reader 최소화/다른 앱 최대화 중 글 클릭 시
    Reader가 숨겨져 "안 열림"처럼 보임(평행 경로 누락).
  - [P2] 모바일 Win tbar에도 —/□ 버튼이 렌더 — ADR이 "모바일 데스크톱 전용"이라 선언했으나 코드가 강제 안 함.
  - [P3] tbar title 상태 무관 고정, openApp `? s.maximized : null` 표현 어색, smoke에 min/max 케이스 없음(백로그).
- 반영(68887e5): openPost에 openApp과 대칭되는 unminimize + maximized 정리. 모바일에선 —/□ 버튼·더블클릭·
  title 생략. tbar title 상태별 분기. openApp 표현 `? k : null` 명확화.

## 2라운드
- 판정: 통과
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 162/162), build 성공, smoke 23/23.
- 신규 결함: 없음.
- 비고(non-blocking): N1 openPost `? s.maximized : null`을 `? "reader" : null`로 통일(본 라운드에서 반영).
  N2 openPost 가시성 회귀 테스트 부재 — useRuehanix 훅 내부라 단위테스트 어려움(레포 기존 패턴), 순수 상태 변환
  분리는 백로그 검토.

## 비고(반영 안 함 — 백로그)
- 최소화된 창 표시(트레이/dock 배지).
- 최대화 단축키.
- min/max smoke 케이스.
- openPost/minimize 등 상태 변환의 순수 함수 분리(회귀 테스트 용이화).
