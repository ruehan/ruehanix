# 0063. 셸 한글화 잔존 + 데스크탑 빈 곳 wheel → 워크스페이스 전환

- 상태: 채택
- 날짜: 2026-07-24
- 관련: [[0046-shell-korean-pass]] (가정: 셸 본문 한국어 일원화는 다회차로)

## 배경

1. 라운드 1 한글화(ADR 0046 등) 이후에도 셸 내 영어 라벨이 다수 잔존한다.
   - `FilesApp`: SORT_OPTIONS 라벨(`latest`/`oldest`/`title a→z`/`title z→a`), 그룹 헤딩(`library`/`sort`/`view`), density 단추(`comfy`/`compact`), 푸터(`↑↓ nav`), 툴바(`{n} posts · {n} total`), 컬럼 헤더(`name`/`category`/`date`), 상태바(`{n} posts`/`esc clear`/단축키 `open·search·cycle sort`).
   - `TerminalApp`: fastfetch 8개 패널 라벨(`OS`/`Kernel`/`WM`/`Theme`/`Shell`/`Role`/`Stack`/`Hobby`).
   - `AboutApp`: 사양 패널 라벨(`CPU`/`GPU`/`Memory`/`WM`/`Uptime`), bio 라인(`full-stack dev · SW Lead` / `sim racing · F1/WEC · bass`).
   - `WebApp`: 네비(`posts`/`projects`/`racing`/`about`), 부제(`FULL-STACK DEVELOPER · SW LEAD`), 카드 푸터(`all posts →`).
   - `MusicApp`: 재생 상태(`NOW PLAYING`/`PAUSED`).
   - `ReaderApp`: 저자 bio 보조 텍스트(`full-stack dev · sim racing · bass`).
   - `RuehanixShell` 데스크톱 위젯: 패널 라벨(`OS`/`WM`/`DE`/`SH`/`WHO`), bio(`한규 · full-stack dev`), status(`Mon 22 Jun 2026 · up 4h 12m`), 스펙 라벨(`CPU`/`RAM`/`DISK`/`NET`/`PROC`), 워크바 reboot 단추 `title="reboot"`.
   - `useRuehanix`: CommandPalette 의 theme 명(`테마: Auto`/`Light`/`Dark`).
   - `lib/ruehanix/data.ts`: THEME_MODES 라벨(`Light`/`Dark`/`Auto`).
2. 워크스페이스(ws) 전환은 Super+1~6 키보드 단축키 한 가지뿐. 트랙패드/마우스 사용자는 키보드 없이 데스크탑을 순회할 수단이 없다. 빈 곳 wheel 로 다음/이전 ws 로 가는 패턴이 가장 자연스럽고(Hyprland 의 `mouse:workspace_switch:on_wheel`에 대응), 위젯/앱/도크/waybar 의 wheel 은 거기서 소비되므로 충돌도 없다.

## 결정

### 1. 셸 라벨 일괄 한국어화

대상 6개 컴포넌트 + 1 훅 + 1 데이터 모듈. 시각 라벨과 ariaLabel/placeholder 는 한국어 그대로였으므로 손대지 않는다 (변경 없음). 키·식별자(예: `SortKey`, `ThemeMode.k`)와 의도된 영문 디자인 용어(예: `APP_META.name` 의 `Files`/`Reader`/`Foto`, `CATS.label` 의 `dev`/`racing`/`moto`/`music`/`blog`, `SettingsApp`의 `localhost`, `CommandPalette`의 `Ctrl+K`)는 그대로 둔다 — 이 셸이 디자인 어휘로 영문 표기를 의도한 범주.

변경 매핑은 다음과 같다.

| 컴포넌트 | 라벨 (영 → 한) |
|---|---|
| `FilesApp` | `latest`/`oldest`/`title a→z`/`title z→a` → `최신`/`오래된`/`제목 가→하`/`제목 하→가`; `library`/`sort`/`view` → `라이브러리`/`정렬`/`보기`; `comfy`/`compact` → `여유`/`빽빽`; `↑↓ nav` → `↑↓ 탐색`; `{n} posts · {n} total` → `{n}개 · 전체 {n}`; `name`/`category`/`date` → `이름`/`카테고리`/`날짜`; `{n} posts`/`esc clear` → `{n}개`/`esc 지우기`; 단축키 `open`/`search`/`cycle sort` → `열기`/`검색`/`정렬 순환` |
| `TerminalApp` | `OS`/`Kernel`/`WM`/`Theme`/`Shell`/`Role`/`Stack`/`Hobby` → `운영체제`/`커널`/`창관리자`/`테마`/`셸`/`역할`/`스택`/`취미` (값은 그대로) |
| `AboutApp` | `CPU`/`GPU`/`Memory`/`WM`/`Uptime` → `프로세서`/`그래픽`/`메모리`/`창관리자`/`가동 시간`; bio 두 줄 → `풀스택 개발 · SW 리드` / `시뮬레이션 레이싱 · F1/WEC · 베이스` |
| `WebApp` | 네비 → `글`/`프로젝트`/`레이싱`/`소개`; 부제 → `풀스택 개발 · SW 리드`; 푸터 → `모든 글 →` |
| `MusicApp` | `NOW PLAYING`/`PAUSED` → `재생 중`/`일시정지` |
| `ReaderApp` | bio 줄 → `풀스택 개발 · 시뮬레이션 레이싱 · 베이스` |
| `RuehanixShell` 위젯 | 패널 → `운영체제`/`창관리자`/`데스크톱 환경`/`셸`/`사용자`; bio → `한규 · 풀스택 개발`; status → `2026-06-22 월 · 가동 4시간 12분`; 스펙 라벨 → `프로세서`/`메모리`/`디스크`/`네트워크`/`프로세스`; reboot `title="reboot"` → `title="재부팅"` |
| `useRuehanix` | `테마: Auto`/`Light`/`Dark` → `테마: 자동`/`라이트`/`다크` |
| `lib/ruehanix/data.ts` | THEME_MODES `label` → `라이트`/`다크`/`자동` (key 는 유지) |

테스트는 한국어 표기로 갱신한다 — `TerminalApp.test.tsx` `OS` → `운영체제`, `AboutApp.test.tsx` `CPU` → `프로세서`, `FilesApp.test.tsx` `library`/`sort`/`view` → `라이브러리`/`정렬`/`보기`, `name`/`category`/`date` → `이름`/`카테고리`/`날짜`, `open`/`search`/`cycle sort` → `열기`/`검색`/`정렬 순환`.

### 2. Option E — 바탕 화면의 wheel 로 워크스페이스 전환

`RuehanixShell.tsx` 의 `${/* WALLPAPER */}` div 에 onWheel 핸들러를 부착한다. 이 div 는 inset:0 으로 데스크탑 전역을 덮지만 다른 z-index 30~500 레이어(데스크탑 위젯 / waybar / desktop dock / win 창) 가 그 위에 올라타므로 wheel 이벤트는 위에서 아래로 흐를 때 그 레이어가 먼저 소비하고, 빈 곳 (벽지 div) 까지 도달한 경우에만 이 핸들러가 받는다.

```tsx
<div
  style={{ position: "absolute", inset: 0, background: vm.wallpaper }}
  onWheel={(e) => {
    if (vm.booting) return;
    if (e.deltaY === 0) return;
    e.preventDefault();
    const cur = vm.ws;
    if (e.deltaY > 0 && cur < 6) vm.gotoWs(cur + 1);
    else if (e.deltaY < 0 && cur > 1) vm.gotoWs(cur - 1);
  }}
/>
```

기존 viewModel 은 `ws`/`gotoWs` 핸들러를 노출하지 않아서 return 직전에 `ws: st.ws`, `gotoWs: handlers.gotoWs` 두 줄을 추가했다. 기존 viewModel 패턴(handlers 객체를 만들지 않고 `vm.toggleKeys`, `vm.toggleCommandPalette` 처럼 직접 노출) 을 따른다.

## 이유와 대안

- **전수 라벨 교체** — 단일 언어(한국어) 환경 가정이므로 i18n 인프라 없이 직접 치환이 가장 단순하다. (대안: i18n — 기각, 오버엔지니어링.)
- **`APP_META.name` / `CATS.label` / `localhost` / `Ctrl+K` 의 영문 유지** — 이 셸은 OS 모티브로 일부 영문 디자인 어휘를 의도적으로 쓴다. About 의 "kernel 6.9.2-rue", "Hyprland", boot log 등이 그 예. 이번 결정은 "오타·잔존" 정리이지 어휘 전반의 한글이 아니다. (대안: 모두 한글로 — 셸 정체성 손상, 기각.)
- **위 라벨의 한국어 매핑** — `운영체제`/`커널`/`창관리자`/`셸` 등으로 풀어쓰되 약자(KB 약어자리) 면 한국어 풀네임. status 의 `Mon 22 Jun 2026` → `2026-06-22 월` (ISO + 한국어 요일 약자) — UX 의도: 한눈에 식별 + 위젯 공간 효율.
- **Option E (빈 곳 wheel) 채택** — Hyprland 의 `mouse:workspace_switch:on_wheel` 과 같은 자연 패턴. 키보드 없는 사용자(트랙패드) 의 단축 의존도 줄임. (대안: Option A — 트랙패드 swipe (4-finger), B — ws 6개 핫코너, C — Super+W 워크스페이스 그리드 오버레이, D — Cmd+Wheel: 폴더/스크롤. — 모두 추가 UI/제스처가 필요. Option E 는 backdrop 만 손대면 되어 가장 가볍고 기존 인터랙션과 충돌 없음.)
- **wheel handler 의 테스트는 작성하지 않음** — 해당 코드는 `RuehanixShell` 안의 인라인 div 핸들러라 shell 전체를 마운트해야 검증 가능하다. shell 은 dynamic import + boot useEffect + 다수 useSyncExternalStore 까지 연결되어 happy-dom 단위 테스트에선 무거우며,이를 위해 backdrop 만 별도 컴포넌트로 추출하는 리팩터링은 본 작업의 범위(라벨 교체 + wheel 1종) 를 벗어난다. 대신 viewModel 에 `ws`, `gotoWs` 가 노출되어 있고 그 핸들러가 `useRuehanix` 내에서 `setSt ↔ gotoWsState` reducer 으로 동작함은 기존 키보드 단축키 경로(Super+1~6) 로 이미 검증된다. wheel 의 경계 클램프(<1, >6 무시) 와 booting·deltaY=0 early-return 은 코드 리뷰로 확인. (대안: `WallpaperBackdrop` 추출 + 단위 테스트 — 다음 작업으로 미룸.)
- **deltaY 만 본다** — 사용자가 좌우 wheel (trackpad horizontal) 을 쓸 가능성 0 에 가깝고, x 축을 ws 전환에 묶으면 의도치 않은 제스처가 끼어들 수 있다. 단일 축 (Y) 만 사용해 안전.

## 영향

- 라벨 교체 파일: `components/ruehanix/FilesApp.tsx`, `TerminalApp.tsx`, `AboutApp.tsx`, `WebApp.tsx`, `MusicApp.tsx`, `ReaderApp.tsx`, `RuehanixShell.tsx`, `useRuehanix.ts`, `lib/ruehanix/data.ts`.
- 테스트 갱신: `TerminalApp.test.tsx`, `AboutApp.test.tsx`, `FilesApp.test.tsx`.
- `viewModel.ts`: return 에 `ws`, `gotoWs` 두 라인 추가. 기존 return 의 `vm.handlers` 컨테이너는 도입하지 않음.
- `RuehanixShell.tsx` 첫 WALLPAPER div 에 onWheel 부착. 같은 div 의 다른 prop 은 변동 없음.
- wheel 핸들러가 backdrop div 의 wheel 만 잡고 다른 레이어의 wheel 을 가로채지 않는다 — wheel 이벤트는 bubbling 하지 않으며, 위젯·앱·도크·waybar 가 위에 있어 그 영역의 wheel 은 그 곳에서 끝난다.
- 부팅 화면(`{vm.booting}`) 에서는 watermark 가 아닌 boot overlay 가 inset:0 으로 덮으므로 wheel 자체가 도달하지 않지만, 코드 방어로 booting 가드도 유지.
- 검증 4종(typecheck/lint/test/build) 모두 통과.
