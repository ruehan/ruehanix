# 0058. 셸·/posts·/posts/[slug] 캐시 완전 비활성화 (revalidate=0)
- 상태: 채택
- 날짜: 2026-07-24

## 배경
ADR 0056(ISR 60s) + ADR 0057(on-demand revalidation API) 으로 푸시 후 새 글 가시화 문제를 풀려고 했지만 근본 해결이 아니었다. 두 문제의 공통 근원은 Vercel CDN edge 가 빌드 시점 prerender HTML 을 stale 로 들고 있는 것이다.

- ISR 60s: 새 글 푸시 후 최대 60초 동안 stale. 빌드 직후 edge race 시 일부 edge 가 이전 빌드를, 일부가 새 빌드를 들고 있어 같은 URL 이 사용자/edge 별로 다른 결과를 반환.
- `revalidatePath` on-demand: 빌드 자체에 묶인 prerender HTML 의 캐시 무효화는 발동하지만, 이미 CDN edge 들에 박혀있는 stale 응답은 그 즉시 일관되게 purge 되지 않는다. `next build` 라우트 표에서 revalidate 컬럼이 붙은 정적 prerender 라우트는 여전히 Vercel 의 정적 자산 캐시 정책 안에 머무른다.

결국 캐시 단계에서 invalidate 만 두드리는 접근은 race 를 줄이지 끝내지 못한다. personal blog 트래픽에서 캐시 효율 이득은 무시할 수 있는 수준이므로, 캐시 단계 자체를 끄는 쪽으로 방향을 튼다.

## 결정
영향 페이지 세 곳(`app/page.tsx`, `app/posts/page.tsx`, `app/posts/[slug]/page.tsx`)의 `revalidate` 값을 `60` → `0` 으로 내린다. `revalidate = 0` 은 Next.js 의 "매 요청 fresh fetch + 렌더" — 빌드 시점 prerender 의 ISR 캐시도, Vercel CDN edge 정적 캐시도 태우지 않는다. Next.js 15 에서 `revalidate = 0` 은 force-dynamic 과 동치이며, 라우트 표에 `ƒ (Dynamic)` 로 표기된다.

`generateStaticParams`(`/posts/[slug]`) 와 `dynamicParams` default 는 유지한다 — 정적 prerender 의 결과를 캐시 단계에서 거치는 게 아니라 빌드 내부에서 즉시 SSR 모드로 떨어뜨리는 식이라 동작은 같다. 데이터 fetch 로직(`getAllPosts`, `getPost`, `getSlugs` 등)은 손대지 않는다.

## 이유와 대안
- 검토한 대안 1: ISR 60s + on-demand revalidate (현재 상태, ADR 0056+0057) — CDN edge race 가 본질적 해결이 안 됨. 위 배경 참조.
- 검토한 대안 2: ISR 60s 단독 — 60초 stale + race 구간 여전히 존재. `curl` 한 번 안 해도 되는 단순함만 남는다.
- 검토한 대안 3: `force-dynamic` 명시 — `revalidate = 0` 과 동치이되 코드 가독성은 떨어진다(revalidate=0 한 줄이 intent 가 더 분명). 채택안과 동치로 봐서 검토만.
- 검토한 대안 4: 캐시 헤더(CDN-Cache-Control) 만 조정 — 정적 prerender HTML 자체가 사라지지 않으면 edge 가 응답할 후보가 그대로 남는다. 라우트 단계에서 캐시 자체를 끄는 게 더 확실.

채택안의 장점: 캐시 단계 자체를 끊어 race 의 발생지를 제거. 새 글 푸시 → Vercel 빌드만 완료되면 즉시 모든 사용자에게 노출. 추가 인프라·시크릿 회전·deploy hook 불필요. 변경 라인 3줄.

## 영향
- `app/page.tsx`, `app/posts/page.tsx`, `app/posts/[slug]/page.tsx` 셋 모두 매 요청 fresh fetch + SSR 렌더.
- 빌드 산출 표기: `next build` 라우트 표에서 셋 다 `ƒ (Dynamic)` 으로 바뀐다.
- compile-time prerender 가 사라지므로 첫 요청 latency 가 SSG/ISR 대비 약간 늘어난다. personal blog 트래픽(<10 req/min) 에서 무시 가능.
- 변경 라인: 3 파일 각 1줄(주석 + export). 다른 코드(데이터 fetch, 라우트, 컴포넌트)는 손대지 않음.
- 후속: `app/api/revalidate` 와 `revalidateSecret` env 는 그대로 둔다 — 캐시가 없는 라우트라 평소엔 호출할 일이 없지만, 평시 외 케이스(예: 외부에 캐시 단계가 추가되는 시점) 를 위한 안전망.

## 후속 작업 (백로그)
- 새 글 푸시 후 build 가 끝나는 순간 실제로 1번째 사용자에게 보이는 시각적 확인(에러 캐시·edge 캐시 어디에도 안 박혀있는지).
- `/feed.xml`, `/sitemap.xml` 도 동일하게 fresh fetch 가 필요한지 별도 검토(현재는 빌드 사이클 가시화 분리 ADR 0056 의 영향 밖에 있음).
