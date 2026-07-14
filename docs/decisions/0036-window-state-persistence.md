# 0036. 창/워크스페이스 layout 영속화 (rh-layout)

- 상태: 채택 (라운드1 P1·P2·P3 반영)
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
- `focused` 같은 ephemeral 슬라이스는 저장하지 않음 — 사용자가 한 번 창을
  클릭해야 Super+Shift+1-6 (포커스 창 워크스페이스 이동) 가 동작. 의도된 UX.
- schema version 1. 형식/필드 누락/잘못된 JSON/version 불일치 시 전체
  `DEFAULT_LAYOUT_SNAPSHOT` 폴백. 일부 필드만 foreign 일 땐 해당 필드만
  DEFAULT 값으로 부분 폴백 — 사용자 데이터 최대한 살리기.
- 파서 검증 강화 (라운드1 P2 반영):
  - `ws` 범위 1..6, `Number.isFinite` 필수
  - `open` 키는 `APP_KEYS` 화이트리스트, 값의 `ws` 도 1..6
  - `order` 원소별 `APP_KEYS` 검증
  - `minimized` 키 화이트리스트 + 값 `boolean` 강제
  - `maximized` null 또는 `APP_KEYS` 화이트리스트
  - `ratios` 값 `Number.isFinite` 강제

## useRuehanix 통합 패턴 (라운드1 P1 반영)

- `useState` lazy init 에서 `localStorage` 를 읽지 **않음**. SSR/하이드레이션
  mismatch 회피 — 첫 user-visible frame 은 항상 `INITIAL` (빈 layout).
- `useEffect` 마운트 1회: `layoutSavedRef.current === false` 일 때 localStorage
  read → `setSt` 로 layout 슬라이스 머지 → ref true.
- 이후 effect: layout 슬라이스 deps 변화 시 200ms debounce write. ui/player
  패턴과 동일 (`uiSavedRef` / `playerSavedRef` 와 같은 1회-스킵 가드).
- 정리: 이 두 단계가 SSR 안전 + 첫 redundant write 0회.

## 이유와 대안

- **sessionStorage** — 탭 닫으면 손실. 거절.
- **IndexedDB** — 큰 데이터에 적합. localStorage 충분. 거절.
- **서버 저장** — 인증 필요. 거절.
- **Sanity dataset 에 저장** — UI 상태와 무관. 거절.
- **schema version 없이 진행** — 향후 필드 추가 시 silent 깨짐. version 1 도입.

## Schema migration 정책 (라운드1 P3-2 반영)

- v1 → v2 배포 시점: v1 사용자 데이터는 **전체 DEFAULT 폴백** (= 사용자 layout
  손실). 마이그레이션 함수를 두지 않고 깨끗이 DEFAULT 로 보내는 정책.
  이유: 사용자가 드물게 다시 워크스페이스를 구성하는 정도의 비용. v1 의
  `floating` 미지원 등 필드 추가 시 v1 데이터에 없는 필드는 모두 `undefined` 로
  남게 되어 runtime 에러 위험 — 안전상 DEFAULT 가 옳다.

## 영향

- 리로드 후 사용자가 마지막 상태 그대로 복귀. Hyprland 친화.
- localStorage 1~수 KB 추가 부담.
- ADR 0023 의 windowState 순수 함수는 그대로 — 영속은 storage 레이어에서.
- floating G2 머지 시 layout-storage 에 floating 슬라이스 추가 + version bump.

## 후속 작업

- G2 머지 시 floating 슬라이스 통합 + version 2.
- (선택) 여러 디바이스 간 sync — 로그인 + 서버 저장. 다음.