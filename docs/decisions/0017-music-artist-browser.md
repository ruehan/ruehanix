# 0017. 음악 앱 — 아티스트 브라우저(카드→상세) + 앨범 엔티티

- 상태: 채택
- 날짜: 2026-06-23

## 배경

음악 앱이 재생목록 중심이었다. 일반 음악 프로그램처럼 **아티스트를 카드로 먼저 보여주고, 누르면 그 가수의
상세(대표 사진·멤버 사진·설명·앨범·노래)로 들어가는** 구조를 원한다.

## 결정

- **엔티티 3개**: `artist`(+멤버), `album`(신규), `track`(+albumRef).
  - artist: 기존(name·photo·bio·genre·origin·links) + `members[]`(name·role·photo).
  - album(신규 문서): title·cover·year·`artistRef`.
  - track: 기존 + 선택 `albumRef`. track은 artistRef(가수)·albumRef(앨범) 둘 다 가질 수 있다.
- **조인은 순수 함수**(`lib/artists/view.ts` `buildArtistViews`)로 클라이언트에서 합친다. 서버는 평면적으로
  artists·albums·tracks를 fetch하고, 조인(artist→albums→songs, artist→songs)을 순수 함수로 TDD한다.
  곡의 재생 인덱스 = `getAllTracks` 순서의 위치 → 상세의 노래 클릭이 `playerSelect(index)`로 재생.
- **화면 분리**: MusicApp에 `compact` prop.
  - **창(full)**: 재생목록 ↔ 아티스트 탭. 아티스트 탭 = 카드 그리드 → 클릭 시 상세(대표사진·멤버·앨범·노래) 인라인 전환(뒤로 가기). 로컬 state로 선택 아티스트 추적.
  - **팝오버(compact)**: 컨트롤 + 재생목록만(좁아서 브라우저 비적합). 아티스트 탭 없음.

## 이유와 대안

- **album 별도 문서 vs 내장**: 실제 음악앱처럼 앨범별 곡 묶음을 위해 별도 문서 + track.albumRef 참조. track이
  앨범에 속하는 자연스러운 모델.
- **조인 순수 함수 vs GROQ 중첩**: GROQ 중첩 역참조는 복잡·취약. 평면 fetch 후 id 기준 클라 조인이 단순·테스트 가능.
- **compact 분리**: 300px 팝오버에 멤버/앨범 그리드는 과밀. 리치 경험은 창에.

## 영향

- `getAllAlbums` 추가, content 객체에 `albums` 키 추가(useRuehanix·RuehanixShell·page).
- `ArtistInfo.members`, 신규 `Album`·`ArtistMember`·`AlbumView`·`ArtistView`·`SongRef` 타입.
- track 쿼리에 `albumId` 투영, artist 쿼리에 members 투영.
- MusicApp 아티스트 탭이 디렉터리(단순 목록) → 브라우저(카드→상세)로 재구성. 0016 디렉터리는 이 구조로 대체.
- 사진(대표·멤버·앨범커버) 외부 CDN → next/image 미설정 일관(eslint-disable, 백로그).
