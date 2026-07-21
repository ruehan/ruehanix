# 0057. on-demand revalidation API 추가
- 상태: 채택
- 날짜: 2026-07-21

## 배경
`/posts` 와 `/posts/[slug]` 를 ISR 60s 로 전환해(ADR 0056) 푸시 후 새 글이 셸에 보이는 지연은
해결됐지만, 두 경로 자체는 여전히 최대 60초 동안 stale. 더 큰 문제는 Vercel 배포 직후 짧게
나타나는 **CDN edge race**: 일부 edge 가 이전 빌드를, 일부가 새 빌드를 들고 있어 같은 URL 이
edge 별로 다른 결과를 반환하는 구간이 존재한다. 사용자가 한쪽을 새로고침하면 글 목록이 보이고,
다른 쪽은 빌드 진행 중이라 비어 보이는 식.

## 결정
`app/api/revalidate/route.ts` 에 on-demand revalidation POST 엔드포인트를 추가.

- 요청: `x-revalidate-secret: <env REVALIDATE_SECRET>` 헤더 + 옵션 JSON body `{ "slug": "..." }`.
- 검증: `process.env.REVALIDATE_SECRET` 과 헤더를 strict 비교. 미설정/불일치 시 401.
- 동작 (검증 통과 시):
  - `revalidatePath("/")` — 셸
  - `revalidatePath("/posts")` — 글 목록
  - `body.slug` 가 non-empty string 이면 `revalidatePath(`/posts/${slug}`)` 추가
- 응답: 200 `{ revalidated: true, slug }` (slug 없으면 `null`).

`lib/sanity/env.ts` 에 `revalidateSecret = process.env.REVALIDATE_SECRET` 노출
(서버 전용, 클라이언트 번들 미진입). `.env.example` 에 placeholder 한 줄 추가.

## 이유와 대안
- 검토한 대안 1: Vercel Deployment Protection / password gate — 외부 서비스 보호용이라
  사용자가 직접 호출하는 hook 과 결이 다르고 CDN edge race 자체를 해결하지 못함.
- 검토한 대안 2: ISR 60s 그대로 두고 CDN 만 믿기 — ADR 0056 의 단기 조치였고, 본질적 해결
  아님. deploy 직후 1~3분 race 가시화는 그대로 남음.
- 검토한 대안 3: webhook 서비스(Zapier / Make) 거쳐 호출 — 시크릿 회전·외부 의존성 추가.
  한 URL 에 curl 한 번이면 되는 일을 정당화 못함.
- 검토한 대안 4: 빌드 자체에 revalidate 호출 배선 — Next.js 가 빌드 중엔 `revalidatePath` 가
  무동작이라 deploy hook 이 별도여야 함. 채택안으로 가는 길의 출발점.

채택안의 장점: Next.js 가 공식 지원하는 표준 패턴, 시크릿 비교만으로 인증, 코드 30 줄 미만,
추가 인프라 없음. deploy hook 이나 Sanity webhook 으로 `curl` 한 줄이면 끝.

## 영향
- 새 라우트 `POST /api/revalidate` 추가. 인증 실패 시 401, 성공 시 200.
- 시크릿 누락(`REVALIDATE_SECRET` 미설정) 시 모든 요청이 401 — fail-closed.
- secret 은 서버 전용으로만 사용. `process.env.REVALIDATE_SECRET` 는 `NEXT_PUBLIC_` 접두사가
  없어 클라이언트 번들에 노출되지 않음.
- 빌드 결과: `next build` 라우트 표에 `ƒ (Dynamic) /api/revalidate` 가 추가된다.
- 다른 페이지·셸·데이터 fetch 로직은 손대지 않았다(작업 범위 외 변경 금지).

## 사용법

```
# 호출 예시
curl -X POST https://ruehan.dev/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"slug":"why-a-desktop-shaped-blog"}'

# Vercel 대시보드 Project Settings → Deploy Hooks 으로 같은 명령 자동 호출 가능
```

## 후속 작업 (백로그)
- Sanity webhook ↔ revalidate 자동 연동(글 publish 시 slug 자동 invalidate).
- secret 회전 절차 문서화(`.env.local` 갱신 + Vercel 환경변수 + deploy hook 재설정).