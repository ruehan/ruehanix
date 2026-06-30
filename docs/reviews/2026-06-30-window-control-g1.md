# 리뷰 기록 — ws/타일 제어 (G1)
- 날짜: 2026-06-30
- 브랜치: feat/ux-window-control
- 최종 판정: 통과 (2라운드)

## 개요
창 자유도 개선 3사이클 중 G1. 기본 빈 워크스페이스(INITIAL.open/order 비움), moveToWs(Super+Shift+1-6),
moveTile(Super+Shift+←/→). 순수 전환 lib/ruehanix/windowState.ts(+moveToWs/moveTile) + 테스트. KEYBINDINGS 갱신.
smoke 갱신(ws2 시드 가정 제거 + e.code 키보드 통합).

## 1라운드
- 판정: 수정 필요
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 197/197), build 성공, smoke 23/23.
- 지적사항:
  - [P1] Super+Shift+1-6 단축키가 안 됨 — Shift+digit의 e.key가 "!@#$%^"로 와서 `k>="1"` 거짓.
    헤드라인 기능 결함.
  - [P2] moveToWs가 maximized 정리 안 함(gotoWs와 발산).
  - [P3] moveToWs open 가드 없음.
  - [P3] smoke "ws2 타일링" 명칭/동작 불일치.
- 반영(db4e6a2): 숫자키 판정을 e.code(Digit1-6) 기반으로 전환(gotoWs/moveToWs 양쪽). moveToWs maximized
  정리(gotoWs와 대칭) + open 가드. 엣지 테스트 3. smoke: e.code 키보드 통합(Alt+Digit2 ws 전환,
  fontWeight 신호) + 시드 가정 제거.

## 2라운드
- 판정: 통과
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 199/199 — windowState 25), build 성공, smoke 24/24.
- 신규 결함: 없음.
- 비고(백로그): smoke가 Alt 단독이라 Shift+digit(P1 진짜 회귀) 직접 커버 못 함 — Playwright Shift+모디파이어+
  digit 합성이 플랫폼 의존. moveToWs 순수 테스트 + Alt+Digit2(e.code 매칭)로 회귀면 수호. P4: moveToWs가
  minimized 창을 특별 취급 안 함(모순 상태 가능) — 백로그.

## 비고(반영 안 함 — 백로그)
- Shift+digit smoke 직접 커버(플랫폼 키 합성).
- moveToWs minimized 창 처리.
- moveTile 공간적 up/down(별도 레이아웃 필요).
- G2 플로팅, G3 togglesplit(후속 사이클).
