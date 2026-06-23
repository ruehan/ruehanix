# 0016. 전체 아티스트 디렉터리 + 콘텐츠 주입 구조 정리

- 상태: 채택
- 날짜: 2026-06-23

## 배경

ADR 0015는 곡의 가수 정보를 "현재 재생 곡 기준"으로만 보여줬다. 사용자가 원한 것은
**모든 아티스트를 보여주는 디렉터리**다. 또 콘텐츠 소스가 글·곡·사진·아티스트 4개로 늘면서
`useRuehanix`의 positional 배열 인자가 4개가 되어 순서 혼동 위험이 생겼다.

## 결정

- **전체 아티스트 디렉터리**: artist 컬렉션을 직접 쿼리(`lib/artists` + `getAllArtists`)해 셸에 주입.
  곡과 연결되지 않은 아티스트도 표시. MusicApp의 "아티스트" 탭을 현재 곡 기준 → **전체 목록**으로 전환.
  카드 클릭 시 소개·링크가 인라인으로 펼쳐진다(확장 상태는 컴포넌트 로컬). 재생 중인 곡의 가수는 강조.
- **아티스트 정규화 공유**: `toArtistInfo`를 `lib/artists/normalize`로 옮겨 export하고, `lib/tracks`의
  artistRef 정규화도 이를 재사용(DRY). `ArtistInfo`에 `id`(Sanity `_id`) 추가 — 디렉터리 key·확장 추적·
  현재 가수 강조 비교용. track 역참조와 artist 쿼리 모두 `"id": _id` 투영.
- **콘텐츠 주입을 객체로**: `useRuehanix(posts, tracks, photos)` → `useRuehanix(content)`로 변경
  (`content = { posts, tracks, photos, artists }`). 동형 배열 4개를 positional로 넘기면 순서가 뒤바뀌어도
  타입이 통과하는 footgun이 있어, 명명 객체 하나로 받는다. `RuehanixShell`도 동일 props.

## 이유와 대안

- **전체 목록 vs 현재 곡 한정**: 사용자 의도가 "모든 아티스트 쇼케이스"였다. 탭을 재활용해 새 앱 없이 제공.
- **content 객체 vs 4번째 positional**: 0015 리뷰에서 인자 증가 시 객체화를 권고했다. 4개 동형 배열은
  순서 실수 위험이 실제적이라 지금 객체로 정리.

## 영향

- `getAllArtists`로 아티스트 전체를 ISR fetch(글·곡·사진과 동일). 사진처럼 0개면 빈 상태.
- `ArtistInfo.id` 추가 → track normalize 테스트의 artistInfo 기대값에 id 반영.
- `useRuehanix`·`RuehanixShell` 시그니처 변경(내부 동작 불변). 향후 콘텐츠 추가는 content에 키 하나만 더한다.
- MusicApp 아티스트 탭이 디렉터리로 바뀜(현재 곡 가수 단일 표시 → 전체 목록·확장).
