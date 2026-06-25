# 0019. 설정 앱 탭/네비 재작성

- 상태: 채택
- 날짜: 2026-06-24
- 관련: [[0011-persist-ui-settings]]

## 배경

`SettingsApp` 사이드바에 6개 탭(General/Appearance/Window Rules/Keybindings/Displays/Wallpaper)이
있었으나 `active` bool이 하드코딩이라 클릭 불가·상태 없음. 항상 Appearance만 표시. 나머지 5개는 장식이었다.
또 기본값 복원·변경 피드백이 없었고, 토글/스와치 등 컨트롤의 a11y(role/aria/키보드)가 빠져 있었다.
Keybindings는 별도 오버레이(`toggleKeys`)로만 존재해 탭과 연결되지 않았다.

## 결정

1. **탭 전환 실구현** — SettingsApp 내 `useState`로 활성 탭 관리. 사이드바 항목이 상수(`SETTINGS_TABS`)에서 오고
   구현된 탭만 클릭 가능. 미구현 탭은 "준비 중" 비활성 표시.
2. **미구현 탭은 제거하지 않고 비활성화** — General/Window Rules/Displays/Wallpaper는
   데스크톱 셸 감성(GNOME/Hyprland 설정 연상)을 위해 남기되 `ready: false`로 클릭 차단·흐림 처리.
3. **KEYBINDS를 lib로 이동(DRY)** — `lib/ruehanix/settings.ts`의 `KEYBINDINGS`를 shell 오버레이와
   Keybindings 탭이 공유. 기존 오버레이 동작·문구는 그대로.
4. **패널 구성** — Appearance(기존 + "기본값으로 복원" 버튼) · Keybindings(공유 목록) · About(정적 메타).
5. **기본값 복원** — `DEFAULT_UI`를 `ui-storage.ts`에 두고, `resetUi()` 핸들러가 `ui`를 이 값으로 되돌린다.
   기존 영속화 effect가 변경을 자동 저장하므로 별도 persist 코드 불필요.
6. **a11y** — 토글은 `role="switch"` + `aria-checked` + 키보드 활성화(`clickable` 헬퍼 재사용).
   테마 스와치는 `role="radio"` 그룹, gap 슬라이더는 `role="slider"` + 방향키 조작(범위 0..28).
7. **변경 피드백** — 글로벌 토스트 시스템 말고 SettingsApp 국소 피드백. 설정 변경 시 짧은 인라인 메시지.

## 이유와 대안

- **미구현 탭을 제거 말고 비활성화** — 제거하면 사이드바가 너무 비어 셸의 "설정 앱" 느낌이 약해진다.
  비활성 표시가 "곧 추가될 수 있는 공간"을 암시해 메타포를 유지한다. (대안: 제거 — 기각, 감성 손실.)
- **KEYBINDS를 lib로** — shell 오버레이와 Keybindings 탭 둘 다 같은 목록을 써야 한다. 컴포넌트 상수로 두면
  한쪽만 바뀌는 드리프트 발생. 순수 데이터라 lib가 적합. (대안: 복사 — 기각, DRY 위반.)
- **토스트를 국소로** — 글로벌 토스트 인프라는 현재 없고, 설정 변경 피드백만 필요하면 오버엔지니어링.
  (대안: 글로벌 토스트 — 기각, 범위 초과.)
- **DEFAULT_UI를 ui-storage에** — 복원 로직이 저장 형식과 같은 곳에 있어야 "기본값"의 의미가 단일.
  useRuehanix의 INITIAL.ui와 동일값이지만, 복원 책임은 storage 계층이 소유. (대안: useRuehanix 로컬 상수 —
  기각, 기본값의 진실 소스가 2곳.)

## 영향

- 새 파일: `lib/ruehanix/settings.ts`(+ test). 수정: `ui-storage.ts`·`useRuehanix.ts`·`viewModel.ts`·
  `apps.tsx`·`RuehanixShell.tsx`(KEYBINDS import 교체).
- 검증: settings.ts 순수 데이터 테스트 + ui-storage DEFAULT_UI 라운드트립. 컴포넌트는 기존처럼 무테스트
  (인라인 JSX라 회귀는 typecheck/lint + 시각 smoke로 방어).
- 백로그: 미구현 4개 탭 중 실제 기능이 필요해지면 `ready: true`로 전환 후 패널 추가. gap 슬라이더 방향키 범위는
  UiState.gap 범위(0..28)와 ui-storage 검증 한계와 일치.
