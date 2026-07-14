# 0036. 창/워크스페이스 layout 영속화 (rh-layout)

- 상태: 채택
- 날짜: 2026-07-14

## 배경

사용자가 페이지를 리로드하면 빈 워크스페이스로 초기화됐다(Hyprland 첫 로그인처럼).
열어둔 창·위치·크기·워크스페이스가 모두 날아감. ADR 0023 의 windowState 순수
함수가 상태 전이를 다루지만 영속은 없었다. ui-storage 의 `rh-ui` (테마/액센트/UI
토글) 가 같은 패턴으로 영속을 하니 layout 도 같은 자리를 빌릴 만했다.

## 결정

`lib/ruehanix/layout-storage.ts` 신설. localStorage 키 `rh-layout`. JSON 직렬화.

- 저장 슬라이스: `ws` (현재 워크스페이스), `open` (앱→ws), `order` (앱 나열),
  `ratios` (워크스페이스 분할 비율), `minimized`, `maximized`.
- `floating` rect 는 main 머지 시점에 없음(G2 가 WIP). 추가 시 schema version
  bump 후 별도 슬라이스로 확장. 현재 G2 미머지 상태의 의도적 보수.
- schema version 1. 형식/필드 누락/잘못된 JSON → `DEFAULT_LAYOUT_SNAPSHOT` 폴백.
- `useRuehanix` 의 `useState` lazy init 에서 1회 read → `INITIAL` 의 layout 슬라이스만
  교체 (다른 필드는 INITIAL 그대로).
- `useEffect` + `setTimeout(200ms)` debounce — drag/resize 중 매 프레임 저장 회피.
  변경 시 직렬화 + `try/catch` (quota/permission).

## 이유와 대안

- **sessionStorage** — 탭 닫으면 손실. 의도와 다름. 거절.
- **IndexedDB** — 큰 데이터에 적합. localStorage 충분. 거절.
- **서버 저장** — 인증 필요. 블로그 셸에서 과함. 거절.
- **Sanity dataset 에 저장** — UI 상태와 무관. 거절.
- **schema version 없이 진행** — 향후 필드 추가 시 silent 깨짐. version 1 도입.

## 영향

- 리로드 후 사용자가 마지막 상태 그대로 복귀. Hyprland 친화.
- localStorage 1~수 KB 추가 부담.
- ADR 0023 의 windowState 순수 함수는 그대로 — 영속은 storage 레이어에서.
- floating G2 머지 시 layout-storage 에 floating 슬라이스 추가 + version bump.

## 후속 작업

- G2 머지 시 floating 슬라이스 통합.
- (선택) 여러 디바이스 간 sync — 로그인 + 서버 저장. 다음.