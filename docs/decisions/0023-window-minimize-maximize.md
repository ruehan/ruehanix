# 0023. 창 관리 — 최소화/최대화

- 상태: 채택
- 날짜: 2026-06-25
- 관련: [[0021-reader-ux-toc-focus-prefs]]

## 배경
9개 UX 피처 중 마지막(창 계열 I). 데스크톱 셸 창(타일) 컨트롤이 닫기(✕)만 있어
Hyprland 스타일 창 관리 메타포가 불완전했다. 최소화(트레이로 숨김)·최대화(단일 창 전체 영역)가 필요.
(주의: ADR 0021의 "포커스 모드"는 Reader 앱 내부의 사이드바 숨김이고,
여기의 "최대화"는 워크스페이스 단위의 창 컨트롤 — 별개.)

## 결정

### 순수 로직: `visibleIds`
- `lib/ruehanix/layout.ts` — `visibleIds(order, open, ws, minimized, maximized) → AppKey[]`.
  현재 워크스페이스에서 실제 타일링할 창 목록.
  - 열려 있고(같은 ws) **최소화되지 않은** 창을 order 순으로.
  - **maximized**가 현재 ws에 있고 최소화되지 않으면 그 창 **단일** 반환(나머지 숨김).
- 단일 id로 `computeLayout`을 돌리면 거터(gutter)가 없는 전체 영역 rect가 나온다 → 최대화 = 풀스크린 타일.

### 상태
- CoreState에 `minimized: Partial<Record<AppKey, boolean>>`, `maximized: AppKey | null` 추가.
- `curIds` 계산을 인라인 filter에서 `visibleIds`로 위임.

### 핸들러
- `minimize(k)` — minimized[k]=true. 포커스가 k였으면 다음 가시 창으로. maximized===k면 maximized=null.
- `toggleMaximize(k)` — maximized를 k로(토글). 동시에 k에 포커스.
- `openApp(k)` — **unminimize**(트레이 복귀) + maximized!==k면 maximized=null(최대화 중 새 창이 가려지는 것 방지).
- `close(k)` — minimized/maximized에서 k 제거.
- `gotoWs(n)` — maximized가 대상 ws에 열려 있을 때만 유지, 아니면 null.

### UI
- 타이틀바(tbar)에 —(최소화)·□(최대화)/❐(복원)·✕(닫기) 버튼. `wbtn` 스타일(min/max 공용, xbtn과 동일 외양).
- **tbar 더블클릭 → 최대화 토글**(Hyprland/일반 OS 관례). `title` 안내.
- 버튼 a11y: `clickable`로 role/tabIndex/aria-label(예 "Reader 최소화").

## 이유와 대안

- **최대화를 단일 id 타일로 모델링** — 별도 "fullscreen" 레이아웃 분기를 만들지 않고, `visibleIds`가 [maximized]만
  반환하면 `computeLayout`이 자연스럽게 전체 rect·거터 없음을 준다. 기존 타일 전환 애니메이션도 그대로 작동.
  (대안: 별도 fullscreen 분기 — 기각, 중복.)
- **최소화를 open 유지 + minimized 플래그** — close는 창을 아예 닫지만 minimize는 open을 유지해 dock/재오픈으로
  복귀. 단일 부울 맵으로 상태 최소. (대안: 별도 tray 배열 — 기각, open과 중복.)
- **openApp이 maximized를 정리** — 최대화(단일 타일) 상태에서 다른 앱을 열면 그 앱이 가려져 "안 열렸다"고 착각.
  새 앱 오픈 시 최대화를 해제해 가시성 보장. (대안: maximized 유지 + 새 앱을 최대화 안에 얹기 — 기각, 복잡·혼란.)
- **최소화 복귀를 openApp으로** — 별도 restore 핸들러 없이 dock 클릭(=openApp)이 unminimize. 단일 진입점.
  (대안: 전용 트레이 UI + restore — 기각, 범위 초과.)
- **더블클릭 토글** — 버튼 외에 빠른 조작. tbar의 onMouseDown(focus)와 충돌 없음(더블클릭은 별도 이벤트).

## 영향
- 수정: layout.ts(visibleIds + test 6), useRuehanix.ts(CoreState 필드 + minimize/toggleMaximize + openApp/close/gotoWs 정리),
  viewModel.ts(curIds 위임 + min/max 맵 + wbtn + isMaximized), RuehanixShell.tsx(Win 버튼 2개 + 더블클릭).
- 검증: verify 통과(typecheck 0·eslint 0·vitest 162/162 — layout +6), build 성공, smoke 23/23.
- 백로그: 최소화된 창 표시(트레이/dock 배지), 최대화 단축키, 모바일엔 의미 없어 데스크톱 전용(모바일은 이미 단일 풀스크린).
