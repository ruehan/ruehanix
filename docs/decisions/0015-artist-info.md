# 0015. 음악 아티스트 정보 — 별도 문서 + track 참조

- 상태: 채택
- 날짜: 2026-06-23

## 배경

음악 앱이 곡 제목·가수 이름(문자열)만 보여줬다. 가수 소개·사진·장르·링크 등 정보를 입력하고
제공하고 싶다. 곡은 이미 Sanity `track` 문서로 관리된다(ADR 0013).

## 결정

- **별도 `artist` Sanity 문서**(name·photo·bio·genre·origin·links[{label,url}])를 두고,
  `track`이 선택적 `artistRef`(reference)로 참조한다. 정보 한 번 입력 → 같은 가수의 모든 곡에 반영.
- **비파괴 전환**: 기존 `track.artist`(문자열)는 표시 라벨로 유지. `artistRef`는 선택 필드 —
  참조가 있으면 리치 정보를 표시하고, 없으면 지금처럼 이름만. 기존 곡이 깨지지 않는다.
- 별도 쿼리 없이 `track` 쿼리에서 `artistRef->{...}` **역참조**로 한 번에 가져온다. `lib/artists` 모듈 불필요,
  `lib/tracks`만 확장. 이미지 URL은 `photo.asset->url` 투영(사진·트랙과 일관).
- 표시: MusicApp(팝오버 공용)에 **재생목록 ↔ 아티스트 탭**. 아티스트 탭은 현재 재생 곡의 가수 정보.
  NOW PLAYING 헤더·컨트롤은 탭과 무관하게 항상 표시(탭은 하단 콘텐츠만 전환). 탭 상태는 컴포넌트 로컬.

## 이유와 대안

- **별도 문서 vs track 필드**: track에 bio·사진·링크를 직접 두면 같은 가수 곡마다 중복 입력. 별도 문서+참조가 DRY.
- **bio plain text**: Portable Text 리치 bio도 가능하나 과함. MVP는 `text`, 리치는 백로그.

## 영향

- `Track`에 `artistInfo: ArtistInfo | null` 추가(참조 없으면 null). normalize가 역참조를 정규화(이름 없으면 null,
  링크는 label·url 모두 있는 것만).
- MusicApp이 상태 컴포넌트가 됨(탭 useState). 팝오버·창이 각자 탭 상태.
- 사진·링크가 외부 CDN이라 next/image 미설정 이슈 동일(eslint-disable, 백로그 일관).
