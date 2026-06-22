# 리뷰 기록 — useRuehanix React Compiler 리팩터링

- 날짜: 2026-06-22
- 브랜치: refactor/usereuhanix-react-compiler
- 최종 판정: 통과 (2라운드)

## 1라운드
- 판정: 수정 필요
- 검증: 리뷰어 직접 — verify EXIT 0(typecheck·eslint 0 error/0 warn·vitest 48/48), build 성공, smoke 16/16.
  완화 4종 삭제·disable 1줄 확인. useSyncExternalStore 참조 안정·하이드레이션 안전, useEffectEvent
  onKey 가드 보존, useCallback 제거 stale-safe, 부팅/reboot cleanup, 테마 effect 모두 비회귀 확인.
- 지적사항:
  - [P2] 시계 초기값 회귀 — `subscribeSys`에 즉시 시드가 없어 재방문·reduced-motion 스킵 경로에서
    부팅이 즉시 false가 되며 시계가 ~1.4초 "00:00" 노출. 구 코드는 마운트에서 동기 setSys로 즉시 시드.
    "동작 불변" 위배. smoke가 시계 값을 단언 안 해 통과시킴.
  - [P3] reboot 인터벌/setTimeout 미정리 — 구 코드에도 있던 선존 이슈(셸 언마운트 없음), 신규 회귀 아님. 백로그.
- 반영:
  - [P2] `subscribeSys` 구독 진입부에서 `sysCache.clock = fmtClock()` + `cb()`로 즉시 1회 시드.
    getSnapshot은 여전히 캐시만 반환(시각 생성 없음 → tearing 방지). 재로드 경로 수동 확인: 시계 즉시 "15:20"(00:00 아님).
  - [P2-센서] smoke에 "재로드 후 시계 즉시 시드(00:00 아님)" 단언 추가 → 회귀 박제(17개).
  - ADR 0009 "회귀 없음" 문구를 P2 수정 반영해 정정.
  - [기록] 본 리뷰 기록 + worklog 작성.

## 2라운드
- 판정: 통과
- 검증: verify EXIT 0(eslint 0 warn, vitest 48/48), build OK, smoke **17/17**(시계 시드 시나리오 포함).
- 신규 결함: 없음. 잔여 P3(reboot 타이머 정리)는 선존·비회귀 백로그.
