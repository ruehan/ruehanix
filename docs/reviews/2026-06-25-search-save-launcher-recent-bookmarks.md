# 리뷰 기록 — 탐색/저장(통합 검색·최근 글·북마크)
- 날짜: 2026-06-25
- 브랜치: feat/ux-search-save
- 최종 판정: 통과 (2라운드)

## 개요
9개 UX 피처 중 탐색/저장 계열(A/B/F). A — 런처 통합 검색(앱·글·아티스트·사진, searchAll 순수+제네릭).
B — visits 외부스토어(LRU), openPost 기록, 리더 사이드바 '최근'. F — bookmarks 외부스토어, 리더 헤더 별 토글 +
사이드바 '북마크'. 신규 ADR 0022.

## 1라운드
- 판정: 수정 필요
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 156/156), build 성공, smoke 22/22.
- 지적사항:
  - [P2-1] 북마크 사이드바 순서가 원본 글 순서(filter) — '최근'(LRU)과 비대칭.
  - [P2-2] Vm 필드 openFirstApp 가 동작(첫 결과)과 불일치(이름이 거짓말).
  - [P3-1] ADR 신규 테스트 수 오기(29→22, search 8→7).
  - [P3-2] smoke "ter" 카운트===1 단언이 데이터 의존(통합검색 시대 취약).
  - [P3-3] 섹션 중복 표시 정책 미명시.
- 반영(6730f0b): bookmarkItems를 bookmarks 배열 순서 매핑. openFirstApp→openFirstResult 리네임(셸 호출부).
  ADR 수치 정정. smoke를 데이터 무의존으로(매칭 없으면 결과 없음+가시, 빈 질의 앱 전체; 단언 1개 추가→23).
  ADR에 중복 정책 명시.

## 2라운드
- 판정: 통과
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 156/156), build 성공, smoke 23/23.
- 신규 결함: 없음.
- 비고(non-blocking P3, docs 커밋에 폴딩 반영): openFirstApp 로컬 함수 dead, appList/launcherList orphan,
  queryActive orphan, ADR smoke 수(22→23). → 라운드2 통과 후 dead code 3종 + filterApps import 제거,
  ADR smoke 23/23 정정 완료.

## 비고(반영 안 함 — 백로그)
- 검색 결과 키보드 상하 이동(현재 Enter=첫 결과).
- 방문/북마크를 런처에도 노출.
- 아티스트/사진 결과의 딥 링크(현재는 해당 앱 오픈만).
