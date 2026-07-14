# 리뷰 기록 — 창/워크스페이스 layout 영속화

- 날짜: 2026-07-14
- 브랜치: feat/window-state-persistence
- 최종 판정: 통과 (2라운드)

## 1라운드

- 판정: 수정 필요 (P1 2건 + P2 2건 + P3 3건)
- 검증: typecheck 0 / eslint 0 / vitest 31 files / 227 tests (layout-storage 7/7) / build 11/11 / smoke 24/24

### 지적사항

- [P1] `useRuehanix.ts:138` — useState lazy init 의 localStorage read 가 SSR/하이드레이션 mismatch 유발. server=INITIAL, client=복원 데이터 갈림 → hydration warning/throw.
- [P1] `useRuehanix.ts` — ui/player 와 같은 layoutSavedRef 같은 1회 스킵 가드 부재. read-then-setSt 직후 동일 데이터 redundant write 1회.
- [P2] `layout-storage.ts:68-80` — 파서 타입 좁히기 사실상 cast. 필드별 tight 검증 부재.
- [P2] `layout-storage.ts:71` — ws 범위 검증 부재 (현재 1..6 만 받는데 음수/거대값 허용).
- [P3] ADR — useState vs useEffect 결정 근거, schema migration 정책, focused 미저장 의도 3종 보강 필요.
- [P3] 주석 "타이트 검증" 거꾸로 적힘.

### 반영

- P1-1: useState lazy init 의 localStorage read 제거. useEffect post-mount 1회 read → setSt 머지. 첫 user-visible frame 항상 INITIAL.
- P1-2: layoutSavedRef 추가. ui/player 와 동일 위치/패턴.
- P2-1: 6개 validator (validateWs/Open/Order/Ratios/Minimized/Maximized) + APP_KEYS 화이트리스트 + 부분 폴백. 5 케이스 추가 (12/12).
- P2-2: validateWs 1..6 강제.
- P3 ADR: useState vs useEffect 결정 근거 (SSR safe + 첫 frame INITIAL), v1→v2 전체 DEFAULT 정책, focused 슬라이스 미저장 의도. 주석 정정.

커밋: `b727e81 fix(shell): 리뷰 라운드1 P1·P2·P3 반영 — SSR-safe 복원 + 파서 강화`

## 2라운드

- 판정: 수정 필요 (P2 1건)
- 검증: 동일 — 모두 통과.

### 지적사항

- [P2] `useRuehanix.ts:297-312` — layout 복원 read 에 try/catch 부재. write 블록은 보호되지만 read 는 무방비. Safari 프라이빗/iframe sandboxed 에서 SecurityError 가능. 같은 파일의 ui/player 복원은 둘 다 try/catch — 비대칭.
- [P3] 커밋 메시지 "redundant 1회 절약" 표현 — write 횟수가 아닌 1st effect 내부 setTimeout 셋업 비용 절감이 정확한 의미. 차단 아님.
- [P3] 테스트 커버리지 좁음 — validateRatios NaN, validateWs NaN, validateOpen non-object, 부분 폴백 composite. 차단 아님.
- [P3] validateOpen 의 ws 폴백 silently 1 강제 — ADR 정책상 DEFAULT.ws=1 정합. 코멘트 한 줄 의도 박기. 차단 아님.

### 반영

- P2: read 에 try/catch 추가. ui/player 와 일관. parseLayoutSnapshot(null) 가 DEFAULT 로 폴백.

커밋: `e76e34e fix(shell): 라운드2 P2 — layout read try/catch (ui/player 와 일관)`

## 후속 가능 작업 (차기)

- floating G2 머지 시 layout-storage 에 floating 슬라이스 통합 + version 2 bump.
- 다중 디바이스 sync — 서버 저장.
- 테스트 커버리지 보강 (Ratios NaN, Ws NaN, Open non-object).