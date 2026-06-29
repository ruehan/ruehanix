# 0022. 탐색/저장 — 통합 검색·최근 글·북마크

- 상태: 채택
- 날짜: 2026-06-25
- 관련: [[0020-ux-foundation-theme-toast]], [[0021-reader-ux-toc-focus-prefs]]

## 배경
9개 UX 피처 중 탐색/저장 계열(A/B/F).
- **A(통합 검색)** — 런처(`Super+D`)가 앱 이름만 필터링. 블로그의 본질인 "글 찾기"가 안 됨.
- **B(최근 글)** — 방문 기록이 없어 재방문 시 다시 스크롤해야.
- **F(북마크)** — 즐겨찾기 개념 없음.
세 기능 모두 "어떤 글을 빨리 다시 찾을 것인가"에 집중.

## 결정

### 공통: 방문/북마크는 외부 스토어(토스트 패턴)
- `bookmark-storage.ts` / `visit-storage.ts` — 순수 로직(parse/serialize/검증 + `toggleBookmark`/`recordVisit` LRU).
  검증은 ui-storage과 대칭(비문자열·형식 어긋나면 null). 한계: 북마크 24, 방문 8.
- `bookmarks.ts` / `visits.ts` — 모듈 수준 외부 스토어. localStorage write-through + useSyncExternalStore.
- **왜 CoreState가 아닌 외부 스토어인가** — ui/player는 "단일 소비자·레이아웃 구동"이라 CoreState.
  방문/북마크는 "다중 읽기·점적 쓰기·회전하는 후보 목록"이라 외부 스토어가 더 가볍고 useRuehanix의
  거대 state 머신을 부풀리지 않는다(ADR 0020 토스트와 동일 근거).

### A. 통합 검색
- 순수 `searchAll(input, query)`(`lib/ruehanix/search.ts`) — 앱·글·아티스트·사진 동시 부분일치.
  **빈 질의는 앱만 전체**(기존 "모든 앱 브라우징" 보존). 글은 title·excerpt, 아티스트·사진은 name·title.
  **제네릭**으로 입력 요소 타입(onClick/color 등 확장 필드)을 결과까지 보존 → viewModel이 onClick을 그대로 씀.
- 런처(viewModel) — searchAll 결과에 onClick 부여(글→openPost, 아티스트→music, 사진→foto).
  `openFirstResult`는 앱>글>아티스트>사진 우선순위로 Enter 처리.
- 런처(Shell) — 카테고리별 `LauncherGroup` 렌더. placeholder/aria-label을 "검색"으로.

### B. 최근 글(LRU)
- `useRuehanix.openPost`가 `recordVisitStore(slug)` 호출(방문 기록).
- 리더 사이드바(`ReaderSidebar`) 상단 "최근" 섹션(visit slug ∩ posts, 상위 6).

### F. 북마크
- 리더 헤더 `BookmarkToggle`(★/☆, `aria-pressed`) → `toggleBookmarkStore`.
- 리더 사이드바 "★ 북마크" 섹션(bookmark slug ∩ posts).
- 토글 시 글로벌 `notify` 피드백.

## 이유와 대안

- **외부 스토어 vs CoreState** — 위 공통 절 참조. CoreState에 넣으면 persist effect 2개 추가 +
  vm 전파 비용. 외부 스토어는 useSyncExternalStore로 필요한 컴포넌트만 구독.
- **searchAll을 제네릭으로** — 앱 결과가 onClick/color를 잃지 않게. 비제네릭이면 viewModel에서 캐스터 필요.
  (대안: 결과를 다시 매핑 — 기각, 비용·중복.)
- **빈 질의는 앱만** — 기존 런처 동작(모든 앱 브라우징) 회귀 방지. 글/아티스트/사진은 질의가 있을 때만.
- **방문을 openPost 훅에서** — 모든 글 진입 경로(사이드바·검색·files)가 openPost를 거치므로 단일 지점 기록.
  (대안: 각 진입점에 기록 — 기각, 누락 위험.)
- **북마크 한계 24·방문 8** — 사이드바·런처 가시성과 localStorage 크기 균형.

## 영향
- 신규: searchAll(search.ts 확장), bookmark-storage(+test 8), visit-storage(+test 7), bookmarks.ts, visits.ts.
- 수정: useRuehanix(openPost 기록), viewModel(통합검색 결과), apps.tsx(ReaderSidebar/ReaderListItem/
  ReaderSidebarSection/BookmarkToggle), RuehanixShell(카테고리 런처 + LauncherGroup), smoke.mjs(aria-label).
- 검증: verify 통과(typecheck 0·eslint 0·vitest 156/156 — 신규 22: search 7·bookmark 8·visit 7 + 기존),
  build 성공, smoke 23/23.
- 표시 정책: 같은 글이 '최근'/'북마크' 섹션과 '모든 글'에 중복 노출될 수 있다 — 컨텍스트별 빠른 접근이
  목적이므로 의도된 중복('모든 글'은 전체 색인 역할).
- 백로그: 검색 결과 키보드 상하 이동(현재 Enter=첫 결과만), 방문/북마크를 런처에도 노출, 아티스트/사진 결과의
  딥 링크(현재는 해당 앱 오픈만).
