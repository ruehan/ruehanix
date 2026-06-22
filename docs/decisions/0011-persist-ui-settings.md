# 0011. UI 설정 영속화 + 빈 상태 문구 정리

- 상태: 채택
- 날짜: 2026-06-22
- 관련: [[0009-usereuhanix-react-compiler-refactor]], [[0010-sanity-posts-source]]

## 배경

셸의 UI 설정(테마 모드·accent·gap·rounded·glow·transp)이 새로고침하면 기본값으로 리셋됐다.
재접속에도 유지되게 한다. 또 빈 상태 안내의 "/studio에서 첫 글을 작성해 보세요" 문구는
사용자가 직접 글을 쓰므로 불필요 — 제거한다.

## 결정

1. **UI 설정 localStorage 영속화**
   - 순수 함수 `parseUiState`/`serializeUiState`(`lib/ruehanix/ui-storage.ts`)로 직렬화·검증.
     형식/범위가 어긋난 저장값은 무시(null → 기본값). vitest로 라운드트립·엣지 검증.
   - **복원**: 마운트 1회 effect에서 localStorage를 읽어 부팅 결정과 **하나의 setState로 합쳐** 적용
     (`set-state-in-effect` disable 1줄 유지 — 늘리지 않음). 브라우저 전용 상태라 렌더/SSR 불가.
   - **저장**: `[st.ui]` 변경 effect에서 localStorage에 기록. **마운트 첫 실행은 복원 전이라 건너뛴다**
     (`uiSavedRef` 가드) — 첫 실행이 기본값으로 저장값을 덮어쓰는 것을 방지.
2. **빈 상태 문구 정리** — Files·Reader·Web·`/posts`의 빈 상태에서 "/studio…" 안내 줄을 제거하고
   "아직 글이 없습니다"만 남긴다.

## 이유와 대안

- **복원을 부팅 effect에 합침(대안: 별도 effect)** — 별도 effect면 `set-state-in-effect` disable이
  하나 더 늘어난다. 부팅 결정 setState와 한 번에 합쳐 disable을 1개로 유지(직전 리팩터링의 깨끗함 보존).
- **저장 첫 실행 스킵(uiSavedRef)** — 복원 effect와 저장 effect가 둘 다 마운트에 돈다. 저장이 먼저
  돌면 기본값(INITIAL)으로 저장값을 덮어쓴다. 첫 실행을 건너뛰어 복원 후 값만 저장.
- **하이드레이션** — 초기 상태는 고정 INITIAL(SSR 일치), 복원은 마운트 후라 mismatch 없음.
  재방문(부팅 스킵) 시 첫 페인트에 짧은 기본 테마 깜빡임 가능성은 수용(부팅 화면/즉시 적용으로 미미).

## 영향
- 검증: verify(vitest 49 — ui-storage 5개 추가), build OK, smoke 18/18(UI 재접속 복원 단언 추가).
  시각 확인: light/accent/gap 저장값이 재로드 후 복원(html.rh-light + --accent 매핑).
- 백로그: theme flash 완전 제거가 필요하면 layout head 인라인 스크립트로 첫 페인트 전 html class 설정.
