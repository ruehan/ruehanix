# 0026. Sanity 클라이언트 임시 우회 — `useCdn:false` + read 토큰 사용

- 상태: 채택
- 날짜: 2026-07-14
- 관련: [[0010-sanity-posts-source]]

## 배경

2026-07-14 BLOG.md → Sanity post 1건을 `sanity datasets import`로 production에 등록.
import 자체는 라이브 API에서 정상(154 블록 모두 보존). 그런데 두 경로에서 모두
글이 보이지 않는 상태가 지속됨.

- 공개 CDN(`apicdn.sanity.io`) — 30분+ 대기에도 기존 ruehanix 글 1건만 응답. 신규
  import 문서 / mutate API로 만든 테스트 문서 모두 미노출. Studio Publish 클릭도
  동일.
- 라이브 API anon (`api.sanity.io`, 토큰 없음) — 동일하게 1건만 응답.
- 라이브 API 인증 (read 토큰) — import 문서, drafts, 기존 글 모두 정상 응답.

## 결정

`lib/sanity/client.ts`에서 다음 두 줄을 임시 변경:

- `useCdn: false` (CDN 우회)
- `token: readToken` (anon이 아닌 인증 라이브 API로)

복구 시 두 줄 모두 원복.

## 이유와 대안

- **anon 라이브 API로 가는 대안 (useCdn:false만, 토큰 없음)** — 안 됨. anon은
  publish 이벤트 기반 인덱스를 쓰는데, API import로 만든 글은 그 인덱스에 들어가지
  못함. 어떤 클라이언트 코드에서 호출해도 anon 응답에서 우리 글이 안 잡힘.
- **CDN이 동기화될 때까지 대기** — 이미 30분+ 경과. Sanity 측 인프라/플랜 이슈
  가능성 있어 자력 복구 보장이 없음. 사용자에게 보이지 않는 시간이 길어짐.
- **CDN 우회 + read 토큰 (채택)** — anon ACL을 피해 데이터셋의 모든 published
  문서를 읽을 수 있음. read 토큰은 서버 전용이고 모든 호출처가 서버 컴포넌트/
  라우트 핸들러라 클라이언트 번들에 노출되지 않는다(코드 검색으로 확인).
- **Studio에서 직접 재생성** — 더 파괴적이고 디버깅 비용 큼. 채택 안 함.

## 영향

- **가시성**: 셸 Reader, `/posts`, `/posts/[slug]`, `/feed.xml`, `sitemap` 모두
  import 글을 즉시 인식(read 토큰이 lib/posts·lib/albums·lib/artists·lib/photos·
  lib/tracks의 공통 클라이언트로 들어가 다른 콘텐츠 타입도 동일 효과).
- **성능**: CDN 캐시 미사용. read 토큰이 인증 라운드트립을 한 번 더 탄다. 페이지
  단위 영향은 미미(개인 블로그 트래픽). 비용은 Sanity 측.
- **보안**: read 토큰이 `.env.local`에 있고 클라이언트 번들에 들어가지 않음을
  코드 단에서 확인. 노출 표면 변화 없음.
- **원복 작업**: CDN/anon 동기화가 살아나는 시점(useCdn:true, token:undefined 두
  줄)으로 되돌리고 ADR 폐기 또는 대체 ADR 작성.
