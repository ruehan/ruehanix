# 리뷰 기록 — 리더 UX(목차·진행률·포커스·표시설정)
- 날짜: 2026-06-25
- 브랜치: feat/ux-reader
- 최종 판정: 통과 (2라운드)

## 개요
9개 UX 피처 중 Reader 계열(C/D/E). C(TOC+진행률) — extractHeadings 순수 함수(id=블록 _key) +
PostBody h2/h3/h4 id 부여 + 우측 TOC(IntersectionObserver 활성 섹션) + 상단 진행률 바.
D(포커스 모드) — 좌측 글 목록 숨김·본문 전폭 토글. E(폰트/폭) — ReaderPrefs localStorage 영속 +
PostBody 본문 font-size를 --rh-body-fs CSS var로(/posts 라우트 무영향). 신규 ADR 0021.

## 1라운드
- 판정: 수정 필요
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 133/133), build 성공, smoke 22/22.
- 지적사항:
  - [P1] apps.tsx changeFont/changeWidth/toggleFocus — setState updater 안에 notify 부작호.
    React 순수 계약 위반 + StrictMode dev 이중 호출로 notify 2회. 실제 결함.
  - [P2] reader.ts extractHeadings — _key 없는 블록이 빈 id("") 통과 → querySelector("#") throw.
    PostBody의 이미지 asset-null 가드와 일관성 부족.
  - [P3] TOC <aside>→<nav> 시맨틱, title=h.text(길 때 hover), 초기 activeId null(첫 스크롤 전 하이라이트 없음),
    스크롤 오프셋 -12가 scrollMarginTop:16과 불일치.
- 반영(커밋 40d5fa6): 다음 값을 클로저에서 먼저 계산 → 순수 updater + 외부 notify(P1). extractHeadings
  if(!id) continue(P2) + 테스트 추가. <nav>, title, activeHeading(activeId ?? headings[0]?.id) 폴백,
  오프셋 44(sticky 툴바 인지 주석)(P3).

## 2라운드
- 판정: 통과
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 134/134 — reader 9로 증가), build 성공, smoke 22/22.
- 신규 결함: 없음.
- 비고(non-blocking): N1 active 식을 map 안에서 매번 계산 → 컴포넌트 본문 activeHeading으로 호이스트(반영).
  N2 오프셋 44 주석 표현 약간 부풂(실제 툴바 ~38px, 여백 포함값이라 동작 무방). N3 포스트 전환 시
  activeId 리셋 안 됨(observer 발화 전 stale → 매칭 실패, 폴백은 null일 때만) — 라운드1 범위 밖, 향후.

## 비고(반영 안 함 — 백로그)
- TOC 모바일 표현(현재 데스크톱만).
- 포커스 모드·TOC 진입 단축키.
- 포스트 전환 시 activeId 초기화(N3 정식 대응).
