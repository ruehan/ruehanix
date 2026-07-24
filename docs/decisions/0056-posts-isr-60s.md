# 0056. /posts 와 /posts/[slug] 를 SSG → ISR(60s) 로 전환
- 상태: 대체됨(→ 0058)
- 날짜: 2026-07-21

## 배경
`/posts` 와 `/posts/[slug]` 가 빌드 시점 SSG(generateStaticParams) 로만 prerender 됐다.
md 글 추가 후 push → Vercel 빌드(1~3분) + CDN edge 전파가 끝나기 전까지 두 페이지에서
새 글이 보이지 않는다. `/` 는 이미 ISR 60s 라 셸에서는 즉시 보였지만, 글 상세/목록은
빌드 사이클에 묶여 있어 사용자 체감에 "푸시 후 잠시 빈 페이지" 증상을 만들었다.

## 결정
두 페이지 라우트에 `export const revalidate = 60;` 을 추가해 ISR 60s 로 전환.
`generateStaticParams` 는 유지해 빌드 시점 알려진 슬러그는 그대로 prerender,
`dynamicParams` 는 Next.js 13+ default `true` 로 둬 새 슬러그는 첫 요청 시
동적 렌더 후 60초 캐시. 데이터 fetch 로직은 손대지 않는다 — 캐시 전략만 페이지 단계에서 바꿈.

## 이유와 대안
- 검토한 대안 1: `revalidate = 0` (SSR) — 빌드 대기 없이 보이지만 매 요청마다 풀 렌더.
  빌드 시점 prerender 의 캐시 효율을 포기.
- 검토한 대안 2: on-demand revalidation (`revalidatePath`) — push 후 web hook 으로
  Vercel API 호출 트리거. 즉시 가시화지만 webhook 인프라·시크릿 회전 비용이 추가됨.
- 검토한 대안 3: ISR 60s — 빌드 prerender 의 캐시 효율은 유지, 새 글은 최대 60초
  지연(현 증상: 1~3분) 로 줄임. 코드 변경 두 줄로 끝나고 Vercel 추가 설정 불필요.
  현 트래픽 규모에 가장 가성비 좋은 해법.

## 영향
- 푸시 후 최대 60초 안에 `/posts`, `/posts/[slug]` 가 새 글을 반영.
- 빌드 시점 prerender 세트는 유지 — 첫 요청 latency 는 SSG 와 동일.
- 새로 추가된 슬러그의 첫 요청만 on-demand 렌더. 두 번째 요청부터 60초 캐시.
- 영향 페이지: `/posts`, `/posts/[slug]` 만. 다른 라우트(`/`, `/feed.xml`,
  `/sitemap.xml`, `/studio/*`)는 손대지 않았다.
- 빌드 산출 표기: `next build` 결과 `/posts` 는 `○ (Static) + Revalidate 1m`,
  `/posts/[slug]` 는 `● (SSG) + Revalidate 1m` 으로 둘 다 revalidate 컬럼에 1m 이 붙음.
