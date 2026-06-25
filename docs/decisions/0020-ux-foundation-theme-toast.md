# 0020. UX 기반층 — 테마 플래시 제거 + 글로벌 토스트

- 상태: 채택
- 날짜: 2026-06-25
- 관련: [[0011-persist-ui-settings]], [[0019-settings-tabs-revamp]]

## 배경

두 가지 기반 결함이 사용자 체감을 깎고 있었다.
1. **테마 깜빡임(flash)** — `useRuehanix`의 테마 적용 effect가 마운트 후(=첫 페인트 후)에
   `html.rh-light`·`--accent`를 쓴다. 재방문 시 저장된 테마가 적용되기 전 짧은 기본(다크) 테마가
   보인다. ADR 0011에서 "백로그: layout head 인라인 스크립트로 첫 페인트 전 html class 설정"으로
   남겨둔 항목.
2. **토스트가 국소적** — 설정 변경 피드백(ADR 0019)이 `SettingsApp` 안의 로컬 state로만 있었다.
   다른 도메인(음악·저장·에러)에서 일관된 피드백을 주려면 글로벌 단일 토스트가 필요.

## 결정

### 1. 테마 플래시 제거 (인라인 head 스크립트)
- 순수 함수 `resolveEarlyTheme(rawUi, prefersLight) → {light, accent}`(`lib/ruehanix/theme.ts`).
  `parseUiState` 결과(또는 실패 시 `DEFAULT_UI`)에 `effMode`·Latte 매핑을 적용. 단일 진실 소스.
- `app/layout.tsx` `<head>`에 blocking 인라인 `<script>` 추가. 본문 페인트 전에 localStorage를 읽어
  `html.rh-light` 클래스 + `--accent` 적용. 스크립트 본문은 `resolveEarlyTheme`과 동일 로직.
- `MOCHA_TO_LATTE` 맵·`DEFAULT_UI`·`UI_STORAGE_KEY`를 import해 스크립트 문자열에 주입 → 맵/기본값의
  단일 진실 소스 유지. 모드 화이트리스트·hex 정규식만 스크립트에 인라인(경량 검증).
- `useRuehanix` 테마 effect는 그대로 유지 → 마운트 후 동일값으로 재적용(idempotent). 인라인 스크립트는
  "첫 페인트"만 담당, effect는 "이후 변경·prefersLight 구독"을 담당.

### 2. 글로벌 토스트 외부 스토어
- `lib/ruehanix/toast.ts` — 모듈 수준 외부 스토어. `notify(msg, ttl=1300)` / `clearToast` / `subscribeToast` /
  `getToast`. `useToast()` 훅이 `useSyncExternalStore`로 구독(SSR getServerSnapshot=null). ttl=0은 스티키,
  재호출은 타이머 리셋(마지막 메시지가 ttl 만큼 생존).
- `RuehanixShell`에 `ToastHost` 추가(화면 하단 중앙, z 9999, `role=status`/`aria-live=polite`).
- `SettingsApp` 로컬 토스트(state·타이머·`SettingsToast` 컴포넌트) 제거 → 글로벌 `notify`로 교체.
  슬라이더 window mouseup 리스너 강건성(`upRef`)은 그대로 — 이건 토스트가 아니라 드래그 종료 감지.

## 이유와 대안

- **인라인 스크립트 로직을 순수 함수로 분리** — head 스크립트는 실행 가능 JS 문자열이라 import할 수 없다.
  대신 동일 로직을 순수 함수로 두고 테스트로 수호하며, 스크립트는 그 함수의 거울 이미지로 유지.
  (대안: 스크립트에서도 검증 생략하고 effect에만 의존 — 기각, 드리프트 위험.)
- **맵만 import해 주입** — 스크립트 안에 9개 색 매핑을 하드코딩하면 palette 변경 시 양쪽을 손으로 맞춰야 한다.
  `JSON.stringify(MOCHA_TO_LATTE)`로 주입해 단일 소스. (대안: 런타임 fetch — 기각, 페인트 전 불가.)
- **토스트를 useSyncExternalStore 외부 스토어로** — React 19 권장 패턴이며 셸의 기존 외부 스토어(뷰포트·시계·OS 선호)
  와 일관. (대안: Context Provider — 기각, 트리 최상단 래핑 필요·번거로움; 외부 스토어가 더 가볍다.)
- **ttl 기본 1300ms** — 짧은 피드백. 스티키(0) 옵션으로 에러 등 장기 메시지 대응. (대안: 고정값 — 기각, 유연성 부족.)
- **ToastHost를 셸 루트에 단일** — 여러 호스트가 구독하면 중복 렌더. 단일 호스트가 단일 토스트 의미에 부합.

## 영향

- 신규: `lib/ruehanix/toast.ts`(+test 7). 수정: `lib/ruehanix/theme.ts`(+ `resolveEarlyTheme`/`MOCHA_TO_LATTE` export,
  theme.test +4), `app/layout.tsx`(인라인 스크립트), `RuehanixShell.tsx`(ToastHost), `apps.tsx`(SettingsApp 국소 토스트 제거).
- 검증: verify 통과(typecheck 0·eslint 0·vitest 118/118), build 성공, smoke 22/22.
- 백로그: 다른 도메인(음악 재생/일시정지·앱 오픈·워크스페이스 이동)에 `notify`를 붙여 피드백 확장.
  prefersLight 변경(auto 모드) 시 인라인 스크립트는 최초 1회만이므로 OS 전환 대응은 useRuehanix effect가 담당(현행 유지).
