# 0021. 리더 UX — 목차·진행률·포커스·표시설정

- 상태: 채택
- 날짜: 2026-06-25
- 관련: [[0020-ux-foundation-theme-toast]]

## 배경
Reader(글 읽기) 앱이 본문만 스크롤하는 단순 구조라 긴 글 탐색이 어려웠다.
- 목차(TOC) 없음 — 어느 장에 있는지, 다른 장으로 어떻게 가는지 안 됨.
- 읽기 진행률 없음.
- 폰트 크기·본문 폭 고정 — 가독성 개인화 불가.
- 좌측 글 목록 사이드바가 항상 영역을 차지해 집중 읽기 방해.
9개 UX 피처 중 Reader 계열(C/D/E)을 이 ADR에서 다룬다.

## 결정

### C. TOC + 읽기 진행률
- 순수 함수 `extractHeadings(body)`(`lib/ruehanix/reader.ts`) — Portable Text 본문에서 h2/h3/h4만
  추출. **id는 블록의 안정적 `_key`**를 써서 PostBody의 렌더링(id)과 TOC 앵커를 맞춘다(단일 진실 소스).
  빈 제목(공백만)은 건너뛴다. 헤딩 텍스트는 자식 span을 이어붙여 다듬는다.
- PostBody(`components/posts/PostBody.tsx`)의 h2/h3/h4 렌더에 `id={value._key}` + `scrollMarginTop` 추가.
  /posts/[slug] 라우트도 같은 PostBody를 쓰지만 id만 추가돼 영향 없음(앵커 호환).
- TOC: 우측 사이드바(데스크톱, 헤딩 있을 때만). **활성 섹션**은 IntersectionObserver로 추적
  (rootMargin 하단 -70% → 상단 30% 영역에 들어온 가장 위 헤딩). 클릭 시 `getBoundingClientRect`
  차분으로 스크롤 컨테이너 내 절대 오프셋을 구해 `scrollTo({behavior:"smooth"})`.
- 진행률: 본문 스크롤 컨테이너 onScroll에서 `scrollTop/(scrollHeight-clientHeight)` → 상단 2px 바.

### D. 포커스 모드
- Reader 내 `focus` 로컬 state 토글. 켜면 **좌측 글 목록 사이드바를 숨기고 본문이 전폭**.
- 이는 reader-internal "집중 읽기"이고, 워크스페이스 전체의 창 최대화(다른 타일까지 숨김)는
  별도 그룹(G4, I)에서 다룬다. 여기선 중복·범위 충돌을 피해 reader에 한정.
- 토글은 툴바 버튼(`aria-pressed`), 변경 시 글로벌 토스트 피드백.

### E. 폰트 크기·본문 폭
- `ReaderPrefs {fontSize, width}`(`lib/ruehanix/reader-storage.ts`)를 localStorage에 영속
  (ui-storage과 대칭인 parse/serialize/검증, 범위 fontSize 13..22·width 560..960).
- 표시: 본문 컨테이너 maxWidth = prefs.width. **PostBody의 p·ul·ol font-size를 `var(--rh-body-fs,16px)`로**,
  Reader 본문 컨테이너가 `--rh-body-fs`를 set. /posts/[slug] 라우트는 변수를 set 안 하므로 **기본 16px 유지**(무영향).
- 툴바 버튼(A−/A+/⇠/⇢)이 ±1px·±40px로 클램프 조정. 헤딩은 px 고정(본문 비율만 조절).

### 공통
- 모든 변경(폰트/폭/포커스)은 글로벌 토스트(`notify`, ADR 0020)로 피드백.
- 툴바·진행률 바는 본문 스크롤 컨테이너 상단에 sticky.

## 이유와 대안

- **헤딩 id를 `_key`로** — 텍스트 기반 slug는 한글·중복·특수문자에서 불안정. Sanity가 부여하는 `_key`는
  안정·고유·문자열이라 CSS 선택자로 안전(CSS.escape로 추가 보호). PostBody와 reader.ts가 같은 값을 공유.
  (대안: 텍스트 slug — 기각, 한글/중복 문제.)
- **활성 섹션을 IntersectionObserver로** — scroll 계산 매 프레임보다 관찰이 저렴·정확. rootMargin으로
  "상단 30%" 히트존을 정의. (대안: scroll 리스너 + getBoundingClientRect 매번 — 기각, 비용·쓰로틀 필요.)
- **폰트 크기를 CSS 변수로** — PostBody 컴포넌트의 fontSize를 직접 prop으로 내리면 /posts 라우트까지 건드려야.
  CSS var(--rh-body-fs,16px) 폴백은 /posts 라우트는 set 안 하면 16px로 무영향, Reader만 set.
  (대안: PostBody에 fontSize prop — 기각, 공용 컴포넌트 침범·/posts 회귀 위험.)
- **포커스를 reader 내부로 한정** — 워크스페이스 단위 최대화는 G4(창 관리)에서 전용으로 다룬다.
  한 그룹에서 두 개념을 섞으면 범위·리뷰가 뒤엉킴. (대안: 여기서 창 최대화까지 — 기각, G4와 충돌.)
- **TOC 항목을 native `<button>`으로** — `clickable()` 헬퍼(spread 객체)로 감싸면 React Compiler의
  `react-hooks/refs` 규칙이 onClick 컨텍스트를 인식 못 해 ref 읽기 오탐. native button + 직접 onClick은
  규칙이 이벤트 핸들러로 인식 + Enter/Space 키보드 활성화가 무료. (대안: div+clickable — 기각, 규칙 오탐.)

## 영향
- 신규: `lib/ruehanix/reader.ts`(+test 8), `lib/ruehanix/reader-storage.ts`(+test 6).
- 수정: `components/posts/PostBody.tsx`(h2/h3/h4 id + scroll-margin, 본문 font-size CSS var),
  `components/ruehanix/apps.tsx`(ReaderApp 전면 재작성 + ReaderBtn 서브컴포넌트).
- 검증: verify 통과(typecheck 0·eslint 0·vitest 133/133), build 성공, smoke 22/22.
- 백로그: TOC 모바일 표현(현재 데스크톱만), 진행률을 상단 바 말고 also 헤더 퍼센트로 표시,
  포커스 모드 진입 단축키.
