# 리뷰 기록 — 사진 폴더 뷰 + 우측 info 패널 + lightbox

- 날짜: 2026-07-14
- 브랜치: feat/photo-folder-view
- 최종 판정: 통과 (2라운드)

## 1라운드

- 판정: 수정 필요 (P1 2건 + P2 2건 + P3 3건)
- 검증: typecheck 0 / eslint 0 / vitest 32 files / 237 tests (group-by-folder 5/5) / build 11/11 / smoke 24/24

### 지적사항

- [P1] `FotoApp.tsx:60-168` — 모바일 레이아웃 깨짐. 240px 우측 사이드바 + 3-col 그리드가 좁은 viewport 에서 충돌. `vm.isMobile` 분기 부재.
- [P1] `FotoApp.tsx:81` — lightbox 트리거가 `onDoubleClick` 뿐. 모바일에서 진입 불가.
- [P2] `FotoApp.tsx:17-24` — `vm.photos` 변경 시 view stale group 잔류 가능.
- [P2] `lib/photos/normalize.test.ts` — folder/description trim·undefined 폴백 회귀 테스트 부재.
- [P3] 4개 파일 EOF newline 누락.
- [P3] lightbox description 위치 `bottom: -58` — 짧은 viewport 에서 잘림 위험.

### 반영

- P1-1: `flexDirection: vm.isMobile ? "column" : "row"`, 그리드 `2 : 3 col`, info 패널 `100% : 240`, 모바일 `maxHeight: 45%` + `borderTop`.
- P1-2: info 패널에 "크게 보기" 버튼 + 힌트 분기 메시지. 데스크톱 더블클릭 유지.
- P2-1: useEffect+setView 제거 → `effectiveView` derive (groups 에 view.group.name 없으면 folders 폴백). React 19 setState-in-effect cascade 회피.
- P2-2: normalize 회귀 테스트 4 케이스 (folder/description trim·undefined).
- P3: 2 파일 EOF newline 정정. lightbox title/description/hint 모두 image container 내부 하단 오버레이 통합.

커밋: `78b69a2 fix(blog): 리뷰 라운드1 P1·P2·P3 반영 — 모바일 레이아웃 + view derive + 회귀 테스트`

## 2라운드

- 판정: 수정 필요 (P2 3건 — docs)
- 검증: 동일 — 모두 통과.

### 지적사항

- [P2] `docs/worklog.md` 에 feat/photo-folder-view 항목 부재 (CLAUDE.md 8단계).
- [P2] `docs/reviews/2026-07-14-photo-folder-view.md` 부재.
- [P2] ADR 0037 의 모바일 분기 / view derive / lightbox 진입 결정 미기록.
- [P3] "크게 보기" 버튼 데스크톱에도 노출. 모바일 한정 권장. (차단 아님)
- [P3] `effectiveView.selectedIdx ?? 0` 의 `?? 0` dead code. (차단 아님)

### 반영

- P2-1/2/3: worklog 항목 + 본 리뷰 파일 + ADR 0037 의 모바일·view·lightbox 결정 보강.

## 신규 결함

없음.

## 후속 가능 작업

- 폴더 진입 키보드 (← 폴더, Enter 진입).
- 슬라이드쇼 자동 진행.
- subfolder (2단계 분류) — 필요 시.
- "크게 보기" 버튼 모바일 한정 노출 (P3-1).
- `?? 0` dead code 정리 (P3-2).