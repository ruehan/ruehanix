# 리뷰 기록 — FilesApp UI 갱신
- 날짜: 2026-07-21
- 브랜치: feat/filesapp-ui-redesign
- 최종 판정: 통과 (1라운드, self-review)

## 1라운드
- 판정: 통과
- 검증: typecheck 0 / eslint 0 error, 2 warning (기존, FilesApp 무관) /
  vitest 41 files / 301 tests (baseline 39/285 → +2 files / +16 tests:
  FilesApp 12 신규 + files-shortcuts 4 신규) / build 10/10 static + /studio dynamic
- 신규 결함: 없음
- 자가 점검 결과:
  - 사이드바 row / density 버튼 / 본문 row 모두 기존 Enter·Space 핸들러 유지
  - 카테고리·정렬 row 의 `aria-pressed` 유지, density 는 `role=radiogroup` +
    활성 항목만 `tabindex=0` 으로 ARIA 강화
  - `EmptyPosts` 폴백 동작 보존 (`posts.length === 0 && <EmptyPosts compact />`)
  - `excerptStyle` 로직(comfy 모드만 excerpt 표시) 보호 영역 그대로
  - `vm.finderCats` / `vm.finderPosts` / `query·sortKey·density` 상태 그대로
- 디자인 의도대로 다르게 적용한 부분 (의도적 결정, 기록):
  - 카테고리 라벨 — 디자인 HTML 은 essay/tutorial/project/note/review 이지만
    실제 데이터 키는 dev/sim/moto/music/blog. 디자인의 모노 심볼 매핑은
    의미 단위로 가져왔고 라벨은 기존 `CATS` 라벨(`dev/racing/moto/music/blog`)
    그대로 사용. 디자인은 prototype 시안, 실제 데이터에 맞춰 결정.
  - 카테고리 색 — 디자인 HTML 의 mocha 팔레트(`#cba6f7/#89b4fa/#f38ba8/...`)와
    동일하게 하드코딩. `catColors(lightMode)` 는 viewModel 영역이라 FilesApp
    만 수정하는 방향 유지. 본문 row 의 `p.catColor`(라이트 적응)와 사이드바
    아이콘 색은 살짝 어긋날 수 있으나 라이트 모드는 추후 보강 과제로 분리.
  - sort/density 라벨 — 디자인 HTML 과 동일하게 영문
    (`latest/oldest/title a→z/title z→a`, `comfy/compact`). 기존 한국어
    라벨(`최신순/오래된순/...`, `여유/빽빽`)에서 디자인 의도(미니멀 mono)로
    교체. 단축키 chip 과 일관성.
  - 상태바 `esc clear` — 디자인 HTML 은 항상 표시이지만 검색어 있을 때만
    의미가 있어 query 존재 시에만 표시 (검색 의도 보존).
  - 컬럼 헤더 sort mark — 디자인 HTML 은 name 옆에 항상 ▾. 우리는 sortKey 에
    따라 해당 컬럼(name|date)에만 화살표 + accent 색 강조. 정렬 의도 시각화.