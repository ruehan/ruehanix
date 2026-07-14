# 0028. smoke 스크립트는 CI 본 잡에서 제외

- 상태: 채택
- 날짜: 2026-07-14

## 배경

`scripts/smoke.mjs` 는 Playwright + Chromium 으로 실제 next start 서버를 띄워
브라우저 동작(boot, 런처, 테마, 콘솔 에러 0)을 검증한다. 통합 회귀 방어 가치는
높지만 다음 비용이 따른다.

- GitHub Actions ubuntu-latest 에서 chromium 설치 + 의존성 다운로드
- `next start` 서버 구동 + 대기(최대 30s) + 페이지 로드 + teardown
- 잡 시간 약 3~5분 추가. 캐시 가능하지만 결정적이지 않음

PR 1회당 5분 증가는 라운드 속도에 의미 있는 마찰이다. typecheck/lint/vitest/build
4 센서가 통과된 PR 만 머지된다는 점, smoke 는 로컬 + 차기 별도 잡(야간 또는 수동
dispatch)에서 돌릴 수 있다는 점을 고려해 본 잡에서는 제외한다.

## 결정

`.github/workflows/ci.yml` 본 `verify` 잡은 다음 4 센서만 호출한다.

- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`

`npm run smoke` 는 자동 트리거 대상이 아니다.

## 이유와 대안

- **smoke 포함** — 단일 잡 단순. 그러나 잡 시간/리소스 비용 큼.
- **smoke 별도 야간 잡** — 운영적으로 좋지만 워크플로 2개 관리 부담. 다음 작업으로 보류.
- **smoke 별도 workflow_dispatch** — 필요 시 수동 트리거. 지금은 PR 게이트가 smoke 없이도
  회귀 방어가 충분(타입·린트·단위·빌드 모두 통과). 채택 안 함.

## 영향

- PR 본 잡은 빠르고 결정적. 라운드 속도 유지.
- 단, smoke 가 잡던 일부 회귀(런처가 안 뜨거나, 부팅이 무한 루프)는 PR 게이트에서
  못 잡는다. 로컬 검증 / 차기 별도 잡 도입으로 보완.
- `npm run smoke` 자체는 로컬·차기 워크플로에서 그대로 사용 가능(별도 변경 없음).