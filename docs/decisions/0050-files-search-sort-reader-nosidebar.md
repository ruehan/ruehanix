# 0050. FilesApp 검색·정렬 + ReaderApp 사이드바 제거

- 상태: 채택
- 날짜: 2026-07-15

## 배경

FilesApp 는 finder 컨셉 (좌측 정적 폴더/devices + 상단 카테고리 chip + 본문
list) 인데 정렬·검색·density 가 없어 단순 list. ReaderApp 는 좌측
`ReaderSidebar` (북마크·최근·모든 글) 가 항상 노출 — 글 본문보다 distractor.

## 결정

### FilesApp 강화
- **사이드바 신설** (188px) — 카테고리 / 정렬 / view 모드 토글. 기존 정적
  폴더/devices 제거.
- **검색 input** — 제목·요약 substring fuzzy.
- **정렬** — `lib/ruehanix/files-sort.ts` 의 `sortPosts(posts, key)` 순수. 4가지:
  date-desc / date-asc / title-asc / title-desc. 한국어 localeCompare, title
  동점 시 date-desc tie-breaker. 7 케이스 테스트.
- **density** — comfortable (default) / compact (1줄, excerpt 숨김).
- **하단 count** — `N posts` 또는 검색 시 `M 중 N`.
- 모든 토글 (카테고리·정렬·density) 에 `tabIndex=0` + `role=button` + Enter/Space
  키보드 (ADR 0049 패턴 일관).

### ReaderApp 사이드바 제거
- 좌측 `ReaderSidebar` 통째로 제거 (북마크·최근·모든 글).
- `focus` state + focus mode 버튼 제거 (사이드바 없으면 focus 효과 무의미).
- `toggleFocus` handler 제거.
- 본문 항상 풀폭 — 본문 + 우측 info 패널 2-column 만.

## 영향

- FilesApp: 9 → ~250줄. 복잡한 layout 인라인. 정렬·검색·density.
- ReaderApp: ReaderSidebar 4개 컴포넌트 (ReaderBtn/ReaderListItem/ReaderSidebarSection/ReaderSidebar) + useBookmarks/useVisits 의 ReaderApp 의존 정리 가능. ~70줄 감소.
- viewModel.finderCats 에 `active: boolean` 추가 — 사이드바의 selected 표시.

## 후속

- 인덱스 시그니처 (sortPosts 의 `T extends { title, date }`) — RowPost 가 추가 필드(`read` 등) 가도 매칭.
- FilesApp 의 density (comfy/compact) — viewModel.finderDensity state + 영속.