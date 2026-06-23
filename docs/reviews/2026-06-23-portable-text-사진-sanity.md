# 리뷰 기록 — 본문 Portable Text 리치 렌더 + 사진 Sanity 전환

- 날짜: 2026-06-23
- 브랜치: feat/rich-content
- 최종 판정: 통과 (2라운드)

## 1라운드
- 판정: 수정 필요
- 검증: verify 통과(typecheck 0·eslint 0/0·vitest 83/83), build 성공(/posts/desktop-blog SSG), smoke 21/21(트랙 1개 존재 → 팝오버 풀플로우 실행).
- 지적사항:
  - [P1] PostBody image 렌더러가 asset 없는 본문 image 블록에 `urlFor().url()`을 try/catch 없이 호출 → throw로 렌더 크래시(RSC 빌드/요청 에러, 클라이언트 크래시). 스키마상 image asset이 required 아니고 normalize가 무검증 보존이라 도달 가능. tracks(videoId)·photos(url) 방어와 대조적으로 body image만 무방어.
  - [P2] (정리 권장) `portableTextToParagraphs`가 이번 변경으로 미사용 export가 됨.
  - (회귀 없음 확인) body 타입 변경 누락 경로 없음(RSS는 excerpt만), PostBody RSC/클라이언트 양립(SSG 프리렌더 성공), 사진 전환·하드코딩 PHOTOS 제거 정상, useRuehanix 3-positional 수용 가능.
- 반영:
  - P1 — normalize에 `sanitizeBody`로 `_type==="image" && !asset` 블록 제외(tracks/photos와 일관) + 단위 테스트(asset 없는 image 제외, 정상 블록 보존). PostBody image 렌더러에도 `!v.asset → null` 가드(방어 심층화).
  - P2 — `portableTextToParagraphs` 함수·describe 테스트·import 제거.

## 2라운드
- 판정: 통과
- 검증: verify 통과(typecheck 0·eslint 0 error/0 warn·vitest 통과), build 성공, smoke 21/21.
- 신규 결함: 없음.
