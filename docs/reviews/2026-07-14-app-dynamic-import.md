# 리뷰 기록 — 셸 콘텐츠 앱 3개 lazy 분리

- 날짜: 2026-07-14
- 브랜치: feat/app-dynamic-import
- 최종 판정: 통과 (3라운드)

## 1라운드

- 판정: 수정 필요 (P1 2건)
- 검증: typecheck 0 / eslint 0 / vitest 28 files / 214 tests / build 11/11 / smoke 24/24

### 지적사항

- [P1] `docs/decisions/0033-app-dynamic-import.md:10-11` — ADR 이 동적 5개를 "각각 200~270줄" 이라 했지만 실측은 Reader 265 / Music 219 / Settings 268 만 200줄 이상. FilesApp 59 / WebApp 59 는 정적 유지 그룹과 같은 규모. 5개를 동일 근거로 dynamic 처리한 것은 부적절.
- [P1] `docs/decisions/0033-app-dynamic-import.md:35` — "약 1~2KB 감소" 같은 추정치. 실측은 양(+) 방향. 가짜 감소 약속 삭제 필요.

### 반영

- 동적 후보 5 → 3 좁힘 (ReaderApp / MusicApp / SettingsApp 만).
- FilesApp / WebApp 정적 복귀 — 6개 정적 그룹으로 일관.
- ADR 줄 수 표기 정확화 (200+ 기준 명시).
- 사이즈 영향 섹션 실측치로 교체. 가짜 감소 약속 삭제.

커밋: `8e8c31f fix(shell): 리뷰 라운드1 P1 반영 — 동적 5→3 좁힘 + ADR 사실 정정`

## 2라운드

- 판정: 수정 필요 (P2 1건 + P3 3건)
- 검증: 동일 — 모두 통과.

### 지적사항

- [P2] `docs/decisions/0033-app-dynamic-import.md:33` — magnitude 수치 "+47KB" 가 라운드2 재측정에서 "+1,634 B gzip (표면 delta) / +11,668 B gzip (앱 코드만)" 으로 정정됨. 라운드1 의 +47KB 도 사실 오류였음.
- [P3] `docs/worklog.md` 에 이번 작업 항목 부재 + `docs/reviews/` 에 본 파일 부재.
- [P3] MusicApp 두 곳 사용 표현 — chunk 공유임을 1줄 보강.
- [P3] 5→3 좁힘 정당성 확인 OK, 앱 배럴 변경 없음 OK — 코드 레벨 회귀 없음.

### 반영 (이번 라운드)

- ADR 영향 섹션의 magnitude 정정 — 표면 +1,634 B / 앱 코드 +11,668 B 분리.
- ADR 에 MusicApp chunk 공유 명시.
- 본 리뷰 파일 + worklog 항목 추가.

## 3라운드

- 판정: 통과
- 검증: 모두 green (typecheck·eslint·vitest 214·build 11/11·smoke).
- 변경: docs-only (ADR magnitude 최종 정정 + 라운드 이력 섹션).
- 산식 일치: 232,935 − 231,301 = 1,634 B ✓, 42,806 − 31,138 = 11,668 B ✓.
- 신규 결함: 없음.

## 후속 가능 작업 (다음 단계)

- `Win` 의 children 을 `visibleIds` 기반으로 조건부 마운트 → dynamic 3앱이 정말 가시
  시점에만 로드. 초기 전송량 감소가 비로소 실현됨. 별도 ADR.
- 9개 전부 dynamic 일관성 검토.