# 0044. 명령 팔레트 (Ctrl+K)

- 상태: 채택
- 날짜: 2026-07-15

## 배경

Hyprland/Linear/VSCode 의 Ctrl+K 패턴. 셸의 모든 액션을 키보드 한 줄로
검색/실행. Launcher(Super+D) 는 시각적 런처 — 명령 팔레트는 텍스트 명령형 UX.
공존.

## 결정

`Ctrl/Cmd+K` → 모달 → 자연어 fuzzy 매치 → Enter 실행. `Esc` 닫기. `↑↓` 선택.

명령 카테고리:
- **app** — 9개 앱 열기 (`openApp` 핸들러)
- **ws** — 1~6 워크스페이스 이동 (`gotoWs`)
- **theme** — light/dark/auto (`setMode`)
- **shell** — 콘텐츠 동기화 (Sanity import 트리거), 단축키 보기 (`toggleKeys`)
- **nav** — 홈/모든 글/Sanity Studio (location.assign)

## 구조

- `lib/ruehanix/commands.ts` — `Command` 타입 + `matchCommands(query, list, limit?)` 순수 함수. 점수: 정확=100, prefix=70, substring=40. group 순서: app → ws → theme → shell → nav.
- `components/ruehanix/CommandPalette.tsx` — client 모달. input + matches list. useState lazy initial (모달 remount 시 fresh). setState in effect 회피 — `safeSelected` derive.
- `useRuehanix` — `commands: Command[]` (useMemo), `toggleCommandPalette`, `showCommandPalette` state. Ctrl+K 핸들러 (`onKey`).
- `RuehanixShell` — `{vm.showCommandPalette && <CommandPalette open commands={vm.commands} onClose={vm.toggleCommandPalette} />}`.

## 영향

- 새 UX 한 줄. 셸 사용성 큰 향상.
- 모달 마운트 시 input focus. Esc / Ctrl+K 닫기.
- nav:home / nav:posts / nav:studio 는 `window.location.assign` — 페이지 navigate.
- shell:sync-posts 는 `/api/sync-posts` 로 navigate. **이 endpoint 없음** — 추가 필요 (차기).
- 모바일 비활성 (`!vm.isMobile`) — 이미 showLauncher 와 동일.

## 후속

- `/api/sync-posts` endpoint — sync-posts.mjs 의 Node 작업을 endpoint 로 옮기거나,
  cli invoke 또는 안내.
- 새 글 추가 시 commands 에 `nav:post:<slug>` 자동 추가.
- commands 의 useMemo deps — handler ref 안정성 보강.