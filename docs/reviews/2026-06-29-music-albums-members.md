# 리뷰 기록 — 음악(앨범 + 멤버)
- 날짜: 2026-06-29
- 브랜치: feat/music-albums-members
- 최종 판정: 통과 (2라운드)

## 개요
WIP types.ts(ArtistMember·Album·SongRef·AlbumView·ArtistView + members/albumId)를 end-to-end 마무리.
새 album 문서 + track albumRef + artist members. 순수 buildArtistViews(조인) + 테스트. Sanity 스키마·쿼리·소스.
아티스트 상세에 멤버·앨범·수록곡 표시 + 재생. 신규 ADR 0024.

## 1라운드
- 판정: 수정 필요
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 173/173), build 성공, smoke 23/23.
- 지적사항:
  - [P2] buildArtistViews — track의 albumRef가 다른 아티스트 소속 앨범(컴필/피처링)일 때 곡이 증발
    (byAlbum엔 들어가나 artistAlbums에서 제외 → 어디에도 안 나타남).
  - [P3] yearCmp 주석-코드 불일치(주석만 수치비교 약속), AlbumView 스프레드로 artistId 런타임 누수,
    NonNullable 불필요.
- 반영(54800ec): 그룹화 조건 강화(album 존재 + artistId 일치 시만 앨범, 아니면 songs 폴백) + 교차엣지 테스트.
  yearCmp 주석 정정. AlbumView 명시적 매핑. NonNullable 제거.

## 2라운드
- 판정: 통과
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 174/174 — views +1), build 성공, smoke 23/23.
- 신규 결함: 없음.
- 비고(non-blocking, 반영): `aid!` 비-null 단언을 `album.id` 키 사용으로 제거(더 견고).

## 비고(반영 안 함 — 백로그)
- 앨범 전체 재생(앨범 단위 큐).
- 앨범 커버 갤러리, 멤버 개인 링크.
- 곡/앨범 데이터가 없을 때 빈 상태 문구 보강.
