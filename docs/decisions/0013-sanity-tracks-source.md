# 0013. 플레이리스트 소스를 Sanity 단일 소스로

- 상태: 채택
- 날짜: 2026-06-23

## 배경

음악 플레이어(ADR 0012)의 플레이리스트가 `lib/ruehanix/data.ts`에 하드코딩돼 있었다.
사용자가 코드를 건드리지 않고 `/studio`에서 곡을 관리하고 싶어 했다.
블로그 글은 이미 Sanity 단일 소스로 전환돼 있다(ADR 0010).

## 결정

- 곡을 Sanity `track` 문서로 관리한다. 스키마 필드: `title`, `artist`, `videoId`(11자 YouTube ID, 정규식 검증),
  `order`(정렬용, 비우면 제목순).
- 글과 동일한 파이프라인을 미러링한다: `lib/tracks/`에 `queries`(GROQ)·`normalize`·`source`(단일 진입점)·`types`.
  `app/page.tsx`가 글과 곡을 `Promise.all`로 서버 fetch해 `RuehanixShell`에 props로 주입(ISR 60초).
- **하드코딩 폴백 없는 순수 Sanity 단일 소스**(글과 동일). 곡이 0개면 빈 배열 → 미니플레이어 숨김.
- `videoId`가 유효하지 않은(11자 아님) 곡은 normalize에서 제외한다(재생 불가하므로).

## 이유와 대안

- **폴백 유지 vs 순수 Sanity**: 하드코딩 시드를 폴백으로 둘 수도 있었으나(빈 Sanity에서도 음악 작동),
  사용자가 "Sanity에서 관리"를 명시했고 글(ADR 0010)과 일관된 단일 소스가 더 단순·예측가능하다.
  순수 Sanity 채택. 대가: `/studio`에 곡을 넣기 전엔 음악이 보이지 않음.
- **트랙 prop 주입 vs 훅 내부 fetch**: 셸/훅은 클라이언트 컴포넌트라 서버 fetch 불가.
  글과 같이 서버 페이지에서 fetch해 prop으로 내린다.

## 영향

- `useRuehanix(posts, tracks)`로 시그니처 변경. 곡 수가 비동기로 정해지므로 저장된 재생 인덱스의
  범위 클램프를 마운트 effect가 아니라 **뷰모델 표시 시점**으로 옮겼다(reducer는 모듈러로 자가 보정).
- 빌드·스모크가 Sanity 네트워크에 의존(글과 동일 기존 특성). 스모크 음악 시나리오는 트랙 유무 무관으로
  작성 — 트랙이 있으면 팝오버 컨트롤러를 검증하고, 0개면 미니플레이어 숨김을 확인한다.
- 하드코딩 `TRACKS`는 제거. 곡 추가는 `/studio`의 "곡(track)" 문서로 한다.
