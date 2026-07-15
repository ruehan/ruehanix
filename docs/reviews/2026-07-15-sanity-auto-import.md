# 리뷰 기록 — sync-posts Sanity dataset 자동 import

- 날짜: 2026-07-15
- 브랜치: feat/sanity-auto-import
- 최종 판정: 통과 (2라운드)

## 1라운드

- 판정: 수정 필요 (P1 2건 + P2 2건 + P3)
- 검증: typecheck 0 / eslint 0 / vitest 33 files / 245 tests / build 11/11 / smoke 24/24

### 지적사항

- [P1] ADR 0039 의 "default 모드 사용" + 코드 "--replace 사용" — 정면 모순. Sanity CLI
  `@sanity/import` 의 createOrReplace 의미 — 동일 _id 만 덮어쓰고 다른 doc 영향 X.
  사실관계 자체는 정상이므로 ADR 의 정책 결정만 정정 필요.
- [P1] `tmpDir` + `mkdirSync` 데드 코드. 의도와 무관한 .next/sanity-import 디렉터리 생성.
- [P2] 동적 import 를 for 루프 안에 — 정적 import 가능.
- [P2] N회 spawn 비효율 — 미반영 (별도 ADR 후보, 현재 2 포스트라 무시 가능).
- [P3] TDD 갭 — 미반영 (차기).

### 반영

- P1-1: ADR 결정 섹션 정정 + "--replace 의미" 섹션 추가 + 코드 주석 정정.
- P1-2: tmpDir/mkdirSync 제거.
- P2-1: 동적 import → 정적.

커밋: `e775af9 fix(blog): 리뷰 라운드1 P1·P2 반영 — ADR 모순 정정 + 정적 import + 데드 코드 제거`

## 2라운드

- 판정: 수정 필요 (P1 1건 + P2 1건)
- 검증: 동일 — 모두 통과.

### 지적사항

- [P1] ADR 결정 섹션 line 19 의 "누적 모드(default) 사용" 표현이 정정 단락과 모순 — 결정 섹션이 "default 모드 사용" 으로 읽히면 정정 자체가 부정되는 형태.
- [P2] review file + worklog 부재 (의도된 분리이나 이번 라운드 합치기로 정리).

### 반영

- P1: 결정 섹션 한 줄 정정 — "--replace (createOrReplace) 모드 사용".
- P2: 본 리뷰 파일 + worklog 항목 추가.

## 후속 가능 작업

- N회 spawn → 1회 통합 (포스트 수 확장 시). 별도 ADR.
- `importToSanity()` 단위 테스트.
- CI sync-posts:verify (dry-run) 단계 추가.