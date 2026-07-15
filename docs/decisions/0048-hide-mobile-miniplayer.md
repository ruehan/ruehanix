# 0048. 모바일 미니플레이어 (topbar 우측) 숨김

- 상태: 채택
- 날짜: 2026-07-15

## 배경

ADR 0047 에서 hotlap/music UI 숨김. music 의 `MusicApp` 윈도우 + popover + Dock
앱 + 명령 팔레트 명령 모두 제거했으나, 모바일 topbar 우측의 **미니플레이어** (현재
재생 곡 표시 + 클릭 시 popover 토글) 가 잔존. `vm.player.hasTracks` 가드
때문에 Sanity 에 music 트랙이 있을 때만 표시되지만, music 비활성 결정과
모순.

## 결정

`components/ruehanix/RuehanixShell.tsx` `MobileTopbar` 의 미니플레이어 JSX 통째로
제거 (data-testid="miniplayer" 포함).

- `vm.player.hasTracks` 가드도 같이 제거 (이 JSX 만 사용처).
- `vm.player` state 자체는 유지 — 향후 music 재활성 시 popover/미니플레이어
  복원에 사용. `vm.player.togglePopover`/`popoverOpen` 은 ADR 0047 에서
  이미 noop/false 처리.

## 영향

- 모바일 topbar 우측 콘텐츠: 시계 + 재부팅 버튼만. (DesktopTopbar/Dock 무관.)
- `data-testid="miniplayer"`/`data-testid="mini-title"` 테스트 셀렉터 0개 —
  회귀 위험 X.
- 미니플레이어 의존 JSX 약 12줄 감소.

## 후속

- music 재활성 시 — ADR 0047 의 7개 복원 + 본 ADR 의 JSX 복원.