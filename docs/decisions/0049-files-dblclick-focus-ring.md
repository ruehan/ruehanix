# 0049. FilesApp 더블클릭 + 키보드 a11y

- 상태: 채택
- 날짜: 2026-07-15

## 배경

Reader 진입이 FilesApp 의 단클릭 한 가지. 더블클릭이 즉시 열기(파일 탐색기
관용) 인지 모름. 키보드 사용자도 행 자체가 button 이 아니어서 Tab/Enter 로
글 열기 어려움.

## 결정

`components/ruehanix/FilesApp.tsx` 의 글 행에:
- `tabIndex={0}` — Tab 이동 가능.
- `role="button"` + `aria-label="… 열기"` — SR 인식.
- `onDoubleClick={p.open}` — 마우스 더블클릭 시 즉시 reader.
- `onKeyDown` — Enter/Space 시 `p.open()`.

`clickable(p.open, …)` 헬퍼 (단클릭 + 키보드) 와 더블클릭이 동시 적용 →
사용자가 어느 입력이든 reader 진입 가능.

## 영향

- 키보드 사용자: Tab → 행 → Enter → reader. a11y 표준.
- 마우스 사용자: 더블클릭 / 더블탭 → reader. macOS Finder 관용.
- 단클릭은 그대로 — 행 강조/aria-pressed 등 없음(시각적 변화 없음).

## 후속

- 같은 패턴 다른 행 (artist, photo item) 에도 적용.
- aria-selected/aria-current — listbox 패턴 정확화.