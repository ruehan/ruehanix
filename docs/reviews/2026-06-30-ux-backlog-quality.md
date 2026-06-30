# 리뷰 기록 — 백로그 소화(B) + 상태 리팩터(D)
- 날짜: 2026-06-30
- 브랜치: feat/ux-backlog
- 최종 판정: 통과 (2라운드)

## 개요
B(백로그) — 런처 키보드 탐색(Launcher 컴포넌트 추출, ↑↓ Enter, 활성 스크롤, aria-activedescendant),
DesktopDock 실행 점/최소화 흐림, Super+F 최대화 단축키 + KEYBINDINGS/위젯 힌트 갱신.
D(품질) — 창 상태전환을 lib/ruehanix/windowState.ts 순수 함수로 추출 + 15 테스트. useRuehanix 위임.
회귀 방어(G4 openPost 가시성·minimize/close maximized 정리·gotoWs ws밖 maximized).

## 1라운드
- 판정: 수정 필요
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 189/189), build 성공, smoke 23/23.
- 지적사항:
  - [P2] gotoWs/close가 포커스 후보를 가시 창(최소화 아님)만으로 좁힘 — 원본 인라인과 발산.
    "동작 보존" 주장이 사실 아님(의도적 버그 수정). 발산 케이스 테스트 누락.
  - [P3-1] openFirstResult dead code(Launcher 인덱스 오픈으로 대체).
  - [P3-2] Super+Q와 Super+F의 preventDefault 불일치.
  - [P3-4] 데스크톱 위젯 힌트에 Q/F 누락.
- 반영(40d433b): windowState 헤더에 의도적 개선 명시 + 엣지 테스트 2(gotoWs 대상 ws 모두 최소화→null,
  close 남은 창 모두 최소화→null). openFirstResult 제거. Super+F preventDefault 주석. 위젯 힌트에 Super+F 추가.

## 2라운드
- 판정: 통과
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 191/191 — windowState 17), build 성공, smoke 23/23.
- 신규 결함: 없음.

## 비고
- B+D가 한 브랜치(CONVENTIONS "범위 하나" 완화) — D의 회귀 방어가 B의 창 흐름을 받치므로 합리적 결합.
  향후은 분리 권장.
- 백로그: Reader 포커스모드 진입 단축키(상태 lift 결정 필요), 검색 결과 수 동기화, windowState 적용 범위 확장.
