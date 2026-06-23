# 0014. Portable Text 리치 렌더 + 사진 Sanity 전환

- 상태: 채택
- 날짜: 2026-06-23

## 배경

글 본문이 `normalizePost`에서 문단 텍스트 배열(`string[]`)로 평탄화돼, 코드블록·이미지·헤딩·리스트·링크가
모두 사라졌다(기술 블로그인데 코드블록이 없음). 또 사진(Foto)은 `data.ts`에 색 그라데이션으로 하드코딩돼
실제 이미지를 올릴 수 없었다.

## 결정

### Portable Text 리치 렌더
- `BlogPost.body`를 `string[]` → **원본 Portable Text 블록 배열**(`PortableTextBlock[]`)로 변경.
  `normalizePost`는 더 이상 평탄화하지 않고 블록을 그대로 보존한다.
- 렌더는 `@portabletext/react`의 `PortableText`(설치됨)로 하고, 공용 컴포넌트 `PostBody`에 커스텀 렌더러를 둔다:
  헤딩(h2~h4)·문단·인용·리스트·링크·인라인 코드·**코드블록**·**본문 이미지**. Reader 앱(클라이언트)과
  `/posts/[slug]`(RSC) 양쪽에서 재사용.
- 스키마 `post.body` 배열에 `image`(alt 포함)와 `codeBlock` 오브젝트(language·code)를 추가한다.
  코드 하이라이트 플러그인(@sanity/code-input)은 새 의존성을 피해 도입하지 않고, 단순 오브젝트 + `<pre><code>`로 렌더.
- RSS는 `excerpt`만 쓰므로 영향 없음. `portableTextToParagraphs`는 유지(다른 평문 용도 대비).

### 사진 Sanity 전환
- 사진을 Sanity `photo` 문서로 관리(image·title·tag·order). 트랙(ADR 0013)과 동일 파이프라인:
  `lib/photos/`(queries·normalize·source·types), 서버 fetch → 셸 prop 주입.
- 이미지 URL은 GROQ `image.asset->url`로 직접 투영(별도 image-url 빌더 불필요). 본문 인라인 이미지는
  asset ref만 오므로 `@sanity/image-url`의 `urlFor`(`lib/sanity/image.ts`)로 렌더 시 URL 생성.
- **순수 Sanity·폴백 없음**(트랙과 일관). 사진이 0개면 Foto 빈 상태. 하드코딩 `PHOTOS` 제거.

## 이유와 대안

- **body 타입 변경 vs 별도 필드 추가**: 별도 `content` 필드를 두면 두 소스가 공존해 혼란. body를 PT로 단일화하고
  평문이 필요한 곳(현재 없음, RSS는 excerpt)만 변환하는 게 단순.
- **코드 플러그인 미도입**: @sanity/code-input은 신택스 하이라이트 UX가 좋지만 새 의존성·스튜디오 설정 추가.
  MVP는 단순 codeBlock 오브젝트로 충분, 하이라이트는 백로그.

## 영향

- `BlogPost.body` 타입 변경 → Reader 앱·`/posts/[slug]`·viewModel(post.paras 제거)·normalize 테스트 수정.
- 사진도 Sanity 네트워크 의존(글·곡과 동일). 빌드·스모크는 사진 유무 무관으로.
- 글에 코드블록/이미지를 넣으려면 `/studio`에서 본문 블록으로 추가. 사진은 `/studio`의 "사진" 문서로.
