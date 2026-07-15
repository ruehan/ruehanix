# 0025. 창 플로팅 (floating windows)

- 상태: 채택 (G2 완성)
- 날짜: 2026-07-15

## 배경

데스크톱 셸에서 모든 창이 타일 레이아웃에 갇혀 있으면 답답. Hyprland 의
floating 처럼 자유 위치/크기로 띄울 수 있어야. 2026-06-30 G1 (ws/타일 제어)
의 후속 G2. ADR 0027 ~ 0040 사이 WIP 단계로 stash 보존.

## 결정

`WindowState.floating: Partial<Record<AppKey, FloatRect>>` 슬라이스 추가.
floating 상태의 앱은 `viewModel.buildVm` 이 computeLayout 결과를 무시하고
`floating[k]` 의 (x, y, w, h) 로 tile 스타일 구성. z-index 150+(focused 200) 로
타일 위에 뜸.

- **토글**: Win 의 chrome 에 floating 토글 버튼 (◌/❏) + `Super+G` 키바인딩.
  부재 시 기본 rect (viewport 60%×70%, 최소 360×240) 추가. 존재 시 제거(타일 복귀).
- **드래그**: titlebar mousedown → mousemove 로 x/y 갱신. viewport 클램프(80px
  이상 보이게).
- **리사이즈**: 우하단 16×16 핸들 → w/h 갱신. 최소 320×200, viewport 클램프.
- **영속**: `layout-storage` v2 bump — `floating` 슬라이스 + schema version 2.
  v1 → v2 마이그레이션 정책(ADR 0036 정한 대로) — 전체 DEFAULT 폴백.
  v1 사용자 layout 손실, 안전 우선.
- **모바일 비활성**: `!vm.isMobile` 가드. 모바일 한정 풀스크린.
- **에러 처리**: dragRef 'float' / 'floatresize' case 분리, mousemove cleanup.

## 이유와 대안

- **전체 윈도우 자유 위치** — 채택. 셸 미감 핵심.
- **타일만 유지** — G1 단계 유지. 답답. 거절.
- **v1 → v2 호환 (마이그레이션 함수)** — 작은 데이터·드문 케이스. 함수 비용
  대비 이득 작음. 거절(전체 DEFAULT).

## 영향

- 초기 번들 변화 X (floating 핸들러는 WIP 부재에 이미 존재).
- `Win` 의 floating 토글 버튼 + 모서리 핸들 + `Super+G` 키.
- localStorage `rh-layout` v2. 기존 v1 사용자 layout 손실 — 재구성 필요.
- viewModel tiles 계산: floating 우선, 그 외 기존 computeLayout.

## 후속 작업

- (선택) float rect 의 viewport 변경 시 자동 보정(화면 작아졌을 때).
- (선택) 플로팅 ↔ 타일 전환 시 부드러운 transition.
- (차기) G3 — 워크스페이스별 다른 layout (각 ws 별 layout 슬라이스).