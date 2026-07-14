# 리뷰 기록 — CI 워크플로 + Node v22 고정

- 날짜: 2026-07-14
- 브랜치: feat/ci-workflow
- 최종 판정: 통과 (1라운드)

## 1라운드

- 판정: 통과
- 검증: typecheck 0 / eslint 0 / vitest 206/206 / next build 11/11 페이지 / smoke 24/24.
  CI yaml 이 호출하는 4 센서 스크립트명(`typecheck`·`lint`·`test`·`build`)이
  `package.json` 스크립트와 정확히 일치 → verify.sh 와 의미 동치.

### 보강 제안 (블로커 아님, 같은 작업에서 즉시 반영)

- [P3] `ci.yml`·`.nvmrc` 두 파일 trailing newline 없음 → 두 파일 모두 newline 추가.
- [P3] `ci.yml` 에 `permissions: { contents: read }` 누락 (least-privilege) → 추가.
- ADR 후보: smoke 제외 결정 → `docs/decisions/0028-smoke-out-of-ci.md` 작성.

### 반영

- 두 파일 trailing newline 추가 (`ci.yml:49`, `.nvmrc:1`).
- verify 잡 `permissions: { contents: read }` 추가 (`ci.yml:18-20`).
- ADR 0028 작성 — smoke 제외의 시간·리소스 트레이드오프와 대안 기록.

커밋: `1198604 fix(ci): 리뷰 라운드1 P3 반영 — newline·least-privilege·ADR 0028`

## 후속 가능 작업 (다음 작업용)

- smoke 별도 잡 (야간 cron 또는 `workflow_dispatch`) — 이번 범위 밖.
- `actions/setup-node` 의 v4 마이너 업 추적 — 의존성 변경 시에만 갱신.