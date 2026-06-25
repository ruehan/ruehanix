# 리뷰 기록 — UX 기반층(테마 플래시 제거 + 글로벌 토스트)
- 날짜: 2026-06-25
- 브랜치: feat/ux-foundation
- 최종 판정: 통과 (2라운드)

## 개요
G(테마 플래시 제거) — resolveEarlyTheme 순수 함수 + layout head 인라인 스크립트로 첫 페인트 전 테마 적용.
H(글로벌 토스트) — lib/ruehanix/toast 외부 스토어 + ToastHost, SettingsApp 국소 토스트 마이그레이션.
신규 ADR 0020. ADR 0011 백로그(테마 플래시) 해소.

## 1라운드
- 판정: 수정 필요
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 118/118), build 성공, smoke 22/22.
- 지적사항:
  - [P1] worklog/reviews 미작성(워크플로 의무) — 병합 전 docs: 커밋으로 합의.
  - [P2] app/layout.tsx:44 인라인 스크립트 ↔ parseUiState gap 검증 드리프트. gap 범위 밖 저장값이
    첫 페인트 light→하이드레이션 dark 깜빡임 회귀.
  - [P2] lib/ruehanix/toast.ts:71-77 useToastCleanup dead code.
  - [P3] RuehanixShell ToastHost 모바일 하단 독 중첩(bottom:26).
  - [P3] 긴 메시지 잘림(whiteSpace:nowrap, 말줄임 없음).
  - [P3] cosmetics — layout 빈 줄 2개.
- 반영(커밋 45c52b6): 인라인 스크립트 if문에 `typeof o.gap==="number" && o.gap>=0 && o.gap<=28` 추가.
  resolveEarlyTheme 테스트에 gap:100 엣지 추가(→ 기본값). useToastCleanup 제거(useEffect import도).
  ToastHost를 `bottomOffset` prop화, 모바일은 `MOBILE_DOCK+12`. maxWidth 80vw + ellipsis. 빈 줄 정리.

## 2라운드
- 판정: 통과
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 118/118 — theme +5·toast 7), build 성공, smoke 22/22.
- 신규 결함: 없음.
- 비고: code-reviewer 서브에이전트가 인프라 결함(`no such column: replacement_seq`, DB 오류)으로
  3회 연속 실행 불가. 따라서 2라운드는 개발 직원이 직접 diff를 정독해 self-review로 대체(객관 센서 +
  전체 diff 검증). 사용자에게 사유를 알렸고 이의 시 정지 합의. 드리프트(gap 검증)·토스트 수명/SSR·
  ToastHost 단일/오프셋/말줄임·SettingsApp dead 변수 정리 모두 확인.

## 비고(반영 안 함 — 백로그)
- 다른 도메인(음악 재생/일시정지·앱 오픈·워크스페이스 이동)에 notify 확장.
- auto 모드에서 OS 라이트 전환 대응은 useRuehanix effect가 담당(인라인 스크립트는 최초 1회).
