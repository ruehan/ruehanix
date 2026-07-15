# 0047. HotLap + Music 앱 UI 숨김

- 상태: 채택
- 날짜: 2026-07-15

## 배경

데스크톱 셸에서 HotLap(심레이싱)과 Music(YouTube 플레이어) 두 앱을 사용 안
함. UI 만 숨김 (코드/데이터/상태는 유지). 향후 재활성 가능.

## 결정

다섯 곳에서 hotlap/music 제거:
1. `lib/ruehanix/types.ts` — `AppKey` 유니언에서 `"hotlap" | "music"` 제거.
2. `lib/ruehanix/data.ts` — `APP_META` 에서 hotlap/music 항목 제거 → `APP_KEYS` 자동 축소.
3. `components/ruehanix/icons.tsx` — `LINE_ICONS` 에서 hotlap/music svg 경로 제거.
4. `components/ruehanix/RuehanixShell.tsx` — `<Win app="hotlap">` / `<Win app="music">` / music-popover / `YouTubeEngine` 호출 제거. `HotlapApp`·`MusicApp` dynamic import 주석 처리.
5. `components/ruehanix/useRuehanix.ts` — `showMusic` state + `toggleMusic` handler 제거. commands 의 `appKeys` 에서 hotlap/music 제거. 토글 핸들러들의 `showMusic: false` 정리.
6. `components/ruehanix/viewModel.ts` — `popoverOpen: false` 하드코딩 (music 비활성). artist 클릭 시 music → reader 로 변경.
7. 테스트 fixture 갱신 — `RuehanixShell.Win.test.tsx` 의 `tiles`, `layout-storage.test.ts` 의 `minimized: { music: true }` → `{ reader: true }`.

## 영향

- Dock, Launcher, 명령 팔레트 모두에서 hotlap/music 안 보임.
- 7개 앱 → 5개 앱 (files/reader/foto/terminal/web/settings/about).
- YouTubeEngine 코드/파일 유지 — 주석 처리로 lazy load 시 복원 가능.
- `viewer/music` 콘텐츠 카테고리 (`CATS` 의 `music`) 는 Sanity 데이터용 — 유지.
- `setMode('music')` 같은 theme 사용 안 함.

## 후속

- 재활성 시 — ADR 0047 의 7개 위치 모두 복원. AppKey 한 줄 복귀로 Dock/Lanucher 자동.
- 또는 차기 ADR 에서 `feature toggle` env 변수로 토글 가능.