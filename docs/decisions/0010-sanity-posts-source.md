# 0010. 블로그 글 소스를 Sanity로 전환 (하드코딩 제거)

- 상태: 채택
- 날짜: 2026-06-22
- 관련: [[0006-content-seo-strategy]], [[0007-sanity-embedded-studio]], [[0008-post-routes-and-seo]]

## 배경

배포·도메인·임베드 스튜디오가 모두 동작하게 됐다(B 경로). 이제 `source.ts`를 Sanity로
교체하고 하드코딩 8글을 제거해 "처음부터" 시작한다. 사진(Foto)·랩타임(HotLap)은 추후 DB,
이번엔 **블로그 글(posts)만** 전환. 사용자가 studio에서 글을 직접 작성한다.

## 결정

1. **소스 교체** — `lib/posts/source.ts`가 `./hardcoded` 대신 `./queries`(Sanity)를 re-export.
   하드코딩 어댑터(`hardcoded.ts`+테스트)·`lib/ruehanix/data.ts`의 `POSTS`·`Post` 타입 사용 제거.
2. **셸에 서버 fetch 주입** — `app/page.tsx`(서버)에서 `getAllPosts()`로 글을 가져와
   `<RuehanixShell posts={posts}/>`로 전달. `useRuehanix(posts)`·`buildVm`이 하드코딩 상수 대신
   주입된 글을 사용. 식별자를 글 `id`에서 **`slug`로** 전환(선택 상태·열기·링크 모두 slug 기반).
   `export const revalidate = 60` — 60초 ISR로 새 글이 재빌드 없이 반영.
3. **빈 상태 처리** — 글 0개면 Files·Reader·Web·`/posts`가 "아직 글이 없습니다 · /studio에서 작성"
   안내를 표시(`vm.post`는 null 허용). 깨지지 않는 빈 블로그.
4. **라우트** — `/posts`·`/posts/[slug]`는 그대로 Sanity 소스를 읽음. 글 없으면 목록 빈 상태,
   존재하지 않는 slug는 `notFound()`(404).

## 이유와 대안

- **하드코딩 유지 + 토글(대안)** — `CONTENT_SOURCE` env 토글로 둘 다 유지할 수 있으나, 사용자가
  "모든 글 없애고 처음부터"라 명시했고 죽은 하드코딩 데이터는 혼란만 준다. 단일 소스(Sanity)로 정리.
- **id → slug 전환** — 라우트·SEO·공유 URL이 모두 slug 기반이므로 셸도 slug로 통일해 `slugForId`
  매핑 헬퍼를 없앴다. 글 자체가 slug를 가지므로 매핑 불필요.
- **빌드/스모크의 Sanity 의존** — 이제 빌드·런타임이 Sanity API에 의존한다(공개 데이터셋이면 토큰
  불필요). 오프라인 빌드 불가라는 트레이드오프가 있으나, 실제 CMS 블로그의 본질이라 수용.
  스모크 시나리오는 글 유무와 무관하게(정적 경로·빈 상태 친화) 재작성.

## 영향
- 검증: verify(typecheck·lint·vitest 44 — hardcoded 테스트 4개 제거분), build OK(/posts·[slug] SSG),
  smoke 17/17(글-무관 시나리오). 빈 데이터셋에서 빈 상태 시각 확인.
- 셸은 이제 SSG+ISR(60초)로 Sanity 글을 받음. studio에서 글 작성 → 60초 내 반영.
- 백로그(ADR 0006 후속): Portable Text 리치 렌더(코드블록·이미지·링크), 글별 동적 OG,
  사진·랩타임의 DB 전환(스키마 추가), 초안/미리보기(읽기 토큰 클라이언트 배선).
- 백로그(스모크): studio에 글을 채운 뒤 실제 글 렌더(셸 Reader·/posts/[slug])를 검증하는
  스모크 시나리오 복원 — 빈 데이터셋이라 이번엔 글-무관 마커로 대체했음.
