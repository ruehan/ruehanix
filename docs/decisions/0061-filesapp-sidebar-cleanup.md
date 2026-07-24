# 0061. FilesApp 사이드바 chrome 정리
- 상태: 채택
- 날짜: 2026-07-24

## 배경
FilesApp 의 사이드바에 셋의 시각 노이즈가 누적됐다.
1. 사이드바 상단 strip 의 `◇ files ⌘F` — chrome title bar 가 이미 앱 icon + name 을 보여주므로 동일 정보를 한 번 더 보여준다.
2. 사이드바 row 마다의 kbd chip (⌘1~⌘6 카테고리 6개 + ⌘⇧L/O/A/Z 정렬 4개 = 10개. 그 외 검색바 ⌘F/⌘K chip 까지 합치면 더 많음) — 셸의 단축키 안내는 `Super + /` keybind overlay 에 이미 일원화돼 있어 사이드바 각 row 의 인라인 chip 은 중복 노이즈다.
3. 사이드바 배경 `linear-gradient(180deg, var(--mantle) 0%, #1a1a28 100%)` — 다른 셸 컴포넌트는 투명·blur 위주인데 사이드바만 별도 그라데이션이 들어가 셸 컨셉과 안 맞다.

## 결정
chrome title bar 가 아닌 FilesApp sidebar 상단 strip (`◇ files ⌘F`) 을 제거한다. `components/ruehanix/RuehanixShell.tsx` 의 `Win` 컴포넌트는 icon + name 을 유지하며 기존 chrome 구조를 보존한다.

`components/ruehanix/FilesApp.tsx` 에서:
- `<aside>` 의 첫 번째 child 였던 상단 strip (`◇` 아이콘, `files` 텍스트, `⌘F` kbd chip, 하단 border) 을 제거하고 스크롤 영역을 직접 child 로 둔다.
- `catShortcut` / `sortShortcut` 호출 제거. import 제거.
- `SideRow` 의 `kbd` prop 시그니처에서 제거, 본문 kbd chip 렌더링 제거.
- `<aside>` 의 `background` 속성 제거 (borderRight 는 유지해 구분선 역할 보존).

`lib/ruehanix/files-shortcuts.ts` 는 변경 없이 둔다 (keybind overlay 의 정렬 단축키 표시 등 다른 용도로 잠재 재사용 가능 + 참조용).

테스트 `FilesApp.test.tsx` 의 `사이드바 카테고리 row 의 kbd chip 표시` 케이스를 "kbd chip 미표시" 로 갱신 (디자인 의도 반전 잠금).

## 이유와 대안
- 옵션 A (FilesApp sidebar 상단 strip 제거, chrome 유지) — 앱 정체성은 공통 chrome 에 일관되게 남기고 FilesApp 내부의 중복 정보만 제거한다.
- 옵션 B (chrome 의 icon + name 숨김) — 모든 앱에 공통인 `Win` 을 변경해 FilesApp 외 앱의 title bar 까지 영향을 주므로 기각한다.
- 옵션 C (padding 만 축소) — 가장 보수적이나 중복 정보 자체는 줄어들지 않는다.

kbd chip 의 경우:
- (1) keybind overlay(Super+/) 에 일원화돼 있다 — chrome title bar 에서도 단축키 자리는 이 오버레이가 담당.
- (2) 사이드바 row 의 chip 은 hover 도 안 해도 보이게 강제 노출돼 학습 단계에선 도움 되지만, 익숙해지면 noise 다분. 본 셸은 사용자가 매일 보는 환경 — 익숙함이 우선.
- (3) 단축키 매핑 자체는 `files-shortcuts.ts` 와 ADR 0059/0057 에 잠금돼 있다. UI 표시만 제거했을 뿐 매핑이 사라지는 건 아니다.

배경 그라데이션:
- 다른 셸 컴포넌트(waybar, topbar, dock)는 모두 `color-mix(in srgb, var(--mantle) NN%, transparent)` + `backdropFilter: blur` 패턴이다. 사이드바의 `linear-gradient` 는 이 패턴과 어긋난다. 부모 chrome 이 이미 `var(--mantle)` 를 깔고 있어 별도 배경 없이도 사이드바가 어색하지 않다.

## 영향
- chrome title bar 의 icon + name 과 window controls 가 모든 앱에서 기존대로 유지된다.
- FilesApp sidebar 의 첫 child 가 스크롤 영역이 되어 중복된 `◇ files ⌘F` strip 과 구분선이 사라진다.
- 사이드바 row 가 10개의 kbd chip 으로부터 해방되어 더 미니멀해진다. 카테고리/정렬 row 의 정보량은 icon + label 로 동일하다.
- 사이드바 배경이 투명해져 부모 chrome 의 mantle 이 드러난다 — 셸 컨셉과 정합한다.
- FilesApp.test 의 kbd 케이스가 "미표시" 검증으로 반전됐다 — 회귀 잠금 유지.