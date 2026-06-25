# 리뷰 기록 — 설정 앱 탭/네비 재작성
- 날짜: 2026-06-25
- 브랜치: feat/settings-revamp
- 최종 판정: 통과 (4라운드)

## 개요
SettingsApp 사이드바(6개 탭이 하드코딩 bool이라 클릭 불가·항상 Appearance만 표시)를 실동작으로 재작성.
Appearance(기본값 복원 추가)·Keybindings·About 패널 구현, 미구현 탭은 "준비 중" 비활성,
토글/스와치/슬라이더 a11y, 변경 시 인라인 토스트. KEYBINDS를 lib로 이동(DRY), DEFAULT_UI를
ui-storage에 두어 reset/INITIAL이 단일 소스 사용. 신규 ADR 0019.

## 1라운드
- 판정: 수정 필요
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 102/102), build 성공, smoke 22/22.
- 지적사항:
  - [P2] apps.tsx:443-444 — accent 라디오 6개 모두 aria-label="강조색 변경"로 중복. 색 구분 불가.
  - [P2] apps.tsx:414,437 — selected를 폰트 굵기·boxShadow 존재 여부로 역추론(viewModel이 이미 알고 있는 값).
  - [P2] apps.tsx:412-451 — radiogroup 방향키 탐색 누락(roving tabindex만, 화살표 순회 없음).
  - [P3] apps.tsx:445 — accent 토스트가 무조건 "강조색 변경"이라 정보 없음.
  - [P3] apps.tsx:465 — 슬라이더 마우스 드래그는 notify 안 함(키보드만).
  - [P3] worklog/reviews 미커밋.
- 반영: ACCENT_PALETTE를 {hex,name}[]로 변경, accentOpts가 name·selected 노출(aria/toast에 색 이름).
  modeOpts/accentOpts에 selected 평탄화(역추론 제거). radiogroup에 onRadioArrow(화살표 순회+즉시 선택).
  슬라이더 onMouseUp notify 추가. (a425150)

## 2라운드
- 판정: 수정 필요
- 검증: verify 통과(107/107 — data.test 5 추가), build 성공, smoke 22/22.
- 지적사항:
  - [P2-1] apps.tsx:407-416 — radiogroup 방향키가 "선택"만 바꾸고 DOM 포커스는 이동하지 않음.
    APG는 "체크 + 포커스 이동" 둘 다 요구. roving tabindex로는 부족.
  - [P3-1] apps.tsx:480 — 슬라이더 onMouseUp이 영역-밖 릴리즈에서 발화 안 함(mouseup은 커서 아래 요소에서 발화).
  - [P3-2] 신규 컨트랙트(ACCENT_PALETTE shape·opts.selected) 테스트 부재.
- 반영: modeRefs/accentRefs(ref 배열)로 화살표 시 `refs.current[nextIdx]?.focus()`(APG 완결).
  onSliderDown이 window mouseup 1회 리스너 추가(영역 밖 릴리즈도 notify, gapRef로 최종값).
  lib/ruehanix/data.test.ts(5) 추가 — ACCENT_PALETTE hex/name 중복 없음·THEME_MODES key 고유.
  (70e00d4)

## 3라운드
- 판정: 수정 필요
- 검증: verify 통과(107/107), build 성공, smoke 22/22.
- 지적사항:
  - [P3] apps.tsx:414-421 — window mouseup 리스너가 자기 정리 패턴만으로는 언마운트·중복 down·
    mouseup 누락 시 잔류/이중 notify 가능(메모리 누수 + 무효 notify).
- 반영: upRef로 리스너 보관 + 언마운트 cleanup useEffect에서 해지 + down 진입 시 기존 리스너 먼저 제거.
  (0915d45)

## 4라운드
- 판정: 통과
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 107/107), build 성공, smoke 22/22. 하네스 GAP 없음.
- 신규 결함: 없음. 엣지(StrictMode 이중 effect·버려진 드래그) 점검도 이상 무.

## 비고(반영 안 함 — 향후 백로그)
- 슬라이더 gapRef 동기화가 비동기 effect라 극단적 타이밍에 구값 notify 가능(현실 영향 미미).
- onTouchStart 부재로 터치 디바이스 슬라이더 미동작(기존 동작, 이번 변경 범위 밖).
