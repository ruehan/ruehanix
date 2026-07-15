# 0046. Lightbox 키보드 a11y

- 상태: 채택
- 날짜: 2026-07-15

## 배경

FotoApp lightbox 의 키보드 조작이 Esc/←/→ 만. WCAG 2.1.1 Keyboard 위반 가능:
Tab 으로 background 로 focus 새어 나감. 초기 진입점 없음. SR 사용자에게
모달 경계 모호. (aria-modal="true" 가 빠져 있었음 — 이번 작업에서 추가.)

## 결정

`nextFocusIndex(current, count, direction)` 순수 함수 (focus-trap.ts) — Tab/Shift+Tab
시 lightbox 내부 focusable (data-lightbox-focus) 사이 cycle. direction `0|1|-1`.

`FotoApp` lightbox 에 통합:
- **Tab / Shift+Tab** — focus trap (`nextFocusIndex` 활용). 외부 background 로 focus 새지 않음.
- **Esc** — close (기존).
- **←/→** — prev/next (기존).
- **Home / End** — 첫/마지막 사진.
- **aria-modal="true"** — 모달 semantics 정확.
- **열릴 때 close button focus** — 키보드 진입점.
- 모든 focusable 에 `data-lightbox-focus` — focus trap 의 querySelector target.

## 영향

- 키보드만으로 lightbox 완전 조작. SR 사용자도 진입점 명확.
- Tab trap 으로 background 클릭/탭 새지 않음.
- Home/End 는 작은 보너스. 비활성화 옵션은 미고려 (방해 X).

## 후속

- focus trap 일반화 — 다른 모달(런처, 명령 팔레트)에도 적용.
- lightbox 진입 시 `aria-describedby` 로 hint 텍스트 연결 (SR 가독성).