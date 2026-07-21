# 0055. Sanity CDN URL Builder 로 사진 화질 개선
- 상태: 채택
- 날짜: 2026-07-21

## 배경

ruehanix 사진 앱(`FotoApp`, `MusicApp`의 아바타)이 Sanity Content Lake 의 raw asset URL 을 그대로 썼다. Next.js `<Image>` 가 Vercel 옵티마이저를 거치지만, Vercel 옵티마이저는 Sanity 가 이미 변환·제공할 수 있는 폭/포맷 변환을 다시 한 번 한다. 결과적으로 (a) 원본 asset 이 그대로 브라우저로 가서 대역폭 낭비, (b) Sanity CDN 의 WebP/AVIF 자동 서빙(`auto=format`)을 활용 못 함, (c) `?w=`, `?h=`, `?fit=` 같은 Sanity 변환 파라미터가 적용 안 됨.

## 결정

`urlFor(asset).width(N).auto("format").quality(Q).url()` 패턴으로 Sanity CDN 변환을 직접 사용. 사용처별 의도가 명확한 4개 helper 를 `lib/sanity/photo-url.ts` 에 둠:

- `photoThumbSrc(asset, size=480)` — 그리드 thumbnail. 4:3 crop. quality 85.
- `photoPanelSrc(asset)` — info 패널. 720x540 crop. quality 88.
- `photoLightboxSrc(asset)` — 라이트박스. width 1600, 비율 유지. quality 92.
- `photoAvatarSrc(asset, size=96)` — 정사각형 아바타. fit crop. quality 85.

데이터 흐름도 일관되게 `Photo`/`ArtistInfo` 의 `url: string` → `asset: PhotoAsset` (Strategy A: 모든 사용처가 helper 호출). GROQ 는 `image.asset->` 로 dereferenced Sanity asset document 를 통째로 투영. `_id` 가 urlFor 의 CDN URL 구성 키.

falsy asset 일 때 helper 는 `""` 반환. `<Image src="">` 는 부모의 grid/aspectRatio 안에서 안전하게 처리 (실제로는 normalize 단계에서 asset 없는 사진이 이미 제외되므로 도달하지 않음 — 방어적).

## 이유와 대안

- **Strategy A 채택 이유**: `Photo` 에 `url: string` 을 동시에 두면 helper 사용처와 raw 사용처가 섞여 일관성이 깨진다. A 는 호출 사이트가 helper 를 반드시 거치게 강제한다.
- **대안 B (url 유지 + helper 사용처만 변환)**: 변경 폭은 작지만 raw `ph.url` 접근이 helper 우회 경로로 남는다. 일관성 손해.
- **대안: Vercel 옵티마이저에 의존**: 현재도 `<Image>` 가 자동 변환하지만 Sanity CDN 의 `auto=format` 가 더 가깝게 원본 품질 유지 (Sanity 가 원본 메타데이터를 알기 때문).

## 영향

- 1 신규 모듈: `lib/sanity/photo-url.ts` (50 줄) + 테스트 12 케이스.
- 1 신규 export 타입: `PhotoAsset` (SanityAsset 기반).
- 6 모듈 수정: `lib/photos/{queries,types,normalize}.ts`, `lib/artists/{queries,types,normalize}.ts`, `lib/tracks/queries.ts`, `lib/ruehanix/types.ts`, `components/ruehanix/{viewModel,FotoApp,MusicApp}.ts`.
- 테스트 4 파일 갱신: `lib/photos/{normalize,group-by-folder}.test.ts`, `lib/artists/{normalize,views}.test.ts`, `lib/tracks/normalize.test.ts`.
- 셸 앱 변경: FotoApp (그리드·패널·라이트박스), MusicApp (아바타) — 다른 셸 앱 미변경.
- 스키마 무변경 (photoType.ts, artistType.ts 그대로).
- `next.config.mjs` 의 `images.remotePatterns` 에 이미 `cdn.sanity.io` 가 등록돼 있어 `next/image` 가 Sanity CDN URL 을 그대로 받아 변환한다. 추가 설정 불필요.
