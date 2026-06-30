# 0024. 음악 — 앨범 + 멤버

- 상태: 채택
- 날짜: 2026-06-29
- 관련: [[0015-artist-info]], [[0016-artist-directory]]

## 배경
이전 음악 작업(아티스트 정보·디렉터리)에서 타입만 남겨둔 WIP가 `lib/ruehanix/types.ts`에 잔존했다
(ArtistMember·Album·SongRef·AlbumView·ArtistView + ArtistInfo.members·Track.albumId). 타입만 있고 구현이
없어 typecheck가 red. 본 ADR은 이 WIP를 end-to-end으로 마무리한다 — 앨범(수록곡 포함)과 밴드 멤버를
모델링하고 아티스트 상세에 표시.

## 결정

### 데이터 모델 (비파괴 확장)
- **Track에 선택 `albumRef`** (→ album 문서 참조). 기존 artist 문자열 라벨·artistRef와 동일한 "참조는 선택"
  원칙(ADR 0015). 정규화 결과 Track.albumId: string | null.
- **새 `album` 문서** — title·cover(이미지)·year·artistRef(→ artist). Album.artistId 로 조인.
- **artist에 `members` 배열** — { name, role, photo }(밴드/그룹 대응). 솔로면 빈 배열.
- **조인 뷰 ArtistView** — { info, albums: AlbumView[], songs: SongRef[] }.
  AlbumView.songs = 해당 앨범의 track들(재생 인덱스 포함). ArtistView.songs = 앨범 미속 track들.

### 파이프라인 (기존 패턴 확장)
- 도메인 모듈 `lib/albums/`({types, normalize, queries, source}) — lib/artists·lib/tracks와 대칭.
- SanityArtistDoc에 members, SanityTrackDoc에 albumRef, 새 SanityAlbumDoc.
- 정규화: toArtistInfo가 members(유효한 이름만) 채우고, normalizeTracks가 albumId를, normalizeAlbums가 Album[].
- 쿼리: artist·track GROQ에 members·albumRef 투영 추가, album 쿼리 신규.

### 순수 조인: `buildArtistViews`
- `lib/artists/views.ts` — `buildArtistViews(artists, albums, tracks) → ArtistView[]`. 순수·테스트 대상.
  앨범은 artistId로, 수록곡은 albumId로 그룹화. 재생 인덱스 = 전체 tracks 내 위치. year 오름차순.
  (단일 진실 소스 — useRuehanix가 이 함수로 ArtistView[]를 만들어 MusicApp에 내림.)

### 표시
- 아티스트 상세(펼침 카드)에 members(이름·역할·사진) + 앨범(표지·연도·수록곡) 섹션 추가.
- 빈 경우(솔로/앨범 없음)는 섹션 생략.

## 이유와 대안

- **album을 별도 문서로** — track에 앨범 메타(표지·연도)를 인라인으로 두면 중복·불일치. 앨범 문서 + track 참조가
  정규화. (대안: track에 인라인 — 기각, 중복.)
- **조인을 순수 함수로** — 회귀 리뷰어 권고("순수 상태 변환 분리 → 테스트 용이"). ArtistView 구성이
  복잡한 그룹화라 순수 함수 + 단위테스트로 수호. (대안: viewModel 안에서 인라인 — 기각, 테스트 불가.)
- **members를 artist에 배열** — 솔로 아티스트가 많으므로 빈 배열 허용(선택). (대안: 별도 member 문서 — 기각, 오버헤드.)
- **albumRef를 track에** — 곡이 앨범에 속하는 방향. 앨범이 tracks 배열을 들면 동기화 비용. (대안: album.tracks[] — 기각.)

## 영향
- 신규: lib/albums/{types,normalize,queries,source}, lib/artists/views.ts(+test), sanity/schemaTypes/albumType.ts.
- 수정: types.ts(WIP 커밋), artistType(members)·trackType(albumRef) 스키마, artist/track 쿼리·normalize,
  useRuehanix ShellContent(albums)·source.ts, viewModel(artistViews), apps.tsx MusicApp(멤버·앨범 표시).
- 검증: green 단위 커밋(types+normalize → join → schema+쿼리 → UI). verify·build·smoke.
- 백로그: 앨범 전체 재생, 앨범 커버 갤러리, 멤버 개인 링크.
